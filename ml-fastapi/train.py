import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image


# -----------------------------
# 1. Dataset Loader
# -----------------------------
class FaceDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        """
        Args:
            root_dir (string): Path to the root directory (e.g. data/train)
        """
        self.root_dir = root_dir
        self.transform = transform

        self.samples = []
        self.class_to_idx = {}

        
        # Each folder = employee_id
        for idx, emp_id in enumerate(sorted(os.listdir(root_dir))):
            emp_path = os.path.join(root_dir, emp_id)
            if not os.path.isdir(emp_path):
                continue
            self.class_to_idx[emp_id] = idx

            for img_file in os.listdir(emp_path):
                if img_file.lower().endswith((".jpg", ".jpeg", ".png")):
                    self.samples.append(
                        (os.path.join(emp_path, img_file), idx)
                    )

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label


# -----------------------------
# 2. DLID-CNN Model (simple CNN)
# -----------------------------
class DLIDCNN(nn.Module):
    def __init__(self, num_classes):
        super(DLIDCNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.fc = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        x = self.fc(x)
        return x


# -----------------------------
# 3. Training Loop
# -----------------------------
def train_model(data_root="data/train", epochs=10, batch_size=32, lr=0.001):
    # Transforms
    transform = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5])  # normalize to [-1,1]
    ])

    # Dataset
    dataset = FaceDataset(root_dir=data_root, transform=transform)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    num_classes = len(dataset.class_to_idx)
    print(f"Training on {len(dataset)} images from {num_classes} employees")

    # Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = DLIDCNN(num_classes=num_classes).to(device)

    # Loss & optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    # Training loop
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0

        for images, labels in dataloader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)

        epoch_loss = running_loss / len(dataset)
        print(f"Epoch {epoch+1}/{epochs}, Loss: {epoch_loss:.4f}")

    # Save trained model + mapping
    os.makedirs("models", exist_ok=True)
    torch.save(model.state_dict(), "models/dlidcnn.pth")
    torch.save(dataset.class_to_idx, "models/label_map.pth")
    print("Model and label map saved.")


if __name__ == "__main__":
    train_model(data_root="data/train", epochs=20, batch_size=32, lr=0.001)
