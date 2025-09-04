# export_onnx.py
import torch
from backbone import IRResNet18

def export(ckpt='ckpts/backbone_final.pt', out='dlid_face.onnx'):
    device = 'cpu'
    net = IRResNet18(512).to(device).eval()
    sd = torch.load(ckpt, map_location=device)
    sd = sd.get('model', sd)
    net.load_state_dict(sd)
    x = torch.randn(1,3,112,112, device=device)
    torch.onnx.export(net, x, out, input_names=['input'], output_names=['embedding'], opset_version=13, dynamic_axes={'input':{0:'batch'}, 'embedding':{0:'batch'}})
    print("Exported", out)

if __name__ == "__main__":
    export()
