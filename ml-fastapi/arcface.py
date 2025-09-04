# arcface.py
"""
ArcMarginProduct (ArcFace / AAM-Softmax head) for training.
After training we drop this head and only keep the backbone for embeddings.
"""
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class ArcMarginProduct(nn.Module):
    def __init__(self, in_features=512, out_features=1000, s=64.0, m=0.50, easy_margin=False):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.s = s
        self.m = m
        self.weight = nn.Parameter(torch.FloatTensor(out_features, in_features))
        nn.init.xavier_uniform_(self.weight)
        self.easy_margin = easy_margin
        self.cos_m = math.cos(m)
        self.sin_m = math.sin(m)
        self.th = math.cos(math.pi - m)
        self.mm = math.sin(math.pi - m) * m

    def forward(self, embeddings, labels):
        # embeddings: [B, in_features], labels: [B]
        embeddings = F.normalize(embeddings, p=2, dim=1)
        W = F.normalize(self.weight, p=2, dim=1)
        # cosθ = embeddings * W^T
        cos = F.linear(embeddings, W)  # [B, out_features]
        sin = torch.sqrt(torch.clamp(1.0 - cos**2, 0.0, 1.0))
        cos_m = cos * self.cos_m - sin * self.sin_m  # cos(θ + m)
        if self.easy_margin:
            cos_m = torch.where(cos > 0, cos_m, cos)
        else:
            cos_m = torch.where(cos > self.th, cos_m, cos - self.mm)
        one_hot = torch.zeros_like(cos)
        one_hot.scatter_(1, labels.view(-1,1), 1.0)
        logits = self.s * (one_hot * cos_m + (1.0 - one_hot) * cos)
        return logits
