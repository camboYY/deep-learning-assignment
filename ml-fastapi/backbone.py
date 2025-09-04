# backbone.py
"""
A lightweight IR-ResNet-ish backbone producing 512-D L2-normalized embeddings.
Input: 3x112x112 (RGB)
Output: 512-D unit vector
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class BasicBlock(nn.Module):
    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_ch)
        self.prelu = nn.PReLU(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_ch)
        self.down = None
        if stride != 1 or in_ch != out_ch:
            self.down = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_ch)
            )
    def forward(self, x):
        identity = x
        out = self.prelu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        if self.down is not None:
            identity = self.down(identity)
        out += identity
        # Using inplace PReLU from nn.functional isn't straightforward; reuse module PReLU is fine
        return F.prelu(out, torch.zeros(1, device=out.device)) if False else out

class IRResNet18(nn.Module):
    def __init__(self, emb_dim=512, input_size=(112,112)):
        super().__init__()
        self.input_layer = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.PReLU(64)
        )
        self.stage1 = nn.Sequential(BasicBlock(64,64), BasicBlock(64,64))
        self.stage2 = nn.Sequential(BasicBlock(64,128,2), BasicBlock(128,128))
        self.stage3 = nn.Sequential(BasicBlock(128,256,2), BasicBlock(256,256))
        self.stage4 = nn.Sequential(BasicBlock(256,512,2), BasicBlock(512,512))
        # compute flattened size after four stages given input size
        h, w = input_size
        # after convs with strides: stage2, stage3, stage4 each reduce by factor 2: total /8
        final_h = h // 8
        final_w = w // 8
        self.output_layer = nn.Sequential(
            nn.BatchNorm2d(512),
            nn.Dropout(p=0.4),
            nn.Flatten(),
            nn.Linear(512 * final_h * final_w, emb_dim),
            nn.BatchNorm1d(emb_dim)
        )
    def forward(self, x):
        x = self.input_layer(x)
        x = self.stage1(x)
        x = self.stage2(x)
        x = self.stage3(x)
        x = self.stage4(x)
        x = self.output_layer(x)
        x = F.normalize(x, p=2, dim=1)
        return x

if __name__ == "__main__":
    # quick smoke test
    model = IRResNet18()
    x = torch.randn(2,3,112,112)
    out = model(x)
    print(out.shape)  # (2,512)
