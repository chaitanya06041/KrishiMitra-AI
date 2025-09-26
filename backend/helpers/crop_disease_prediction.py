import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import json

def accuracy(outputs, labels):
    _, preds = torch.max(outputs, dim=1)
    return torch.tensor(torch.sum(preds == labels).item() / len(preds))

class ImageClassificationBase(nn.Module):
    def training_step(self, batch):
        images, labels = batch
        out = self(images)
        loss = F.cross_entropy(out, labels)
        return loss

    def validation_step(self, batch):
        images, labels = batch
        out = self(images)
        loss = F.cross_entropy(out, labels)
        acc = accuracy(out, labels)
        return {"val_loss": loss.detach(), "val_accuracy": acc}

    def validation_epoch_end(self, outputs):
        batch_losses = [x["val_loss"] for x in outputs]
        batch_accuracy = [x["val_accuracy"] for x in outputs]
        epoch_loss = torch.stack(batch_losses).mean()
        epoch_accuracy = torch.stack(batch_accuracy).mean()
        return {"val_loss": epoch_loss, "val_accuracy": epoch_accuracy}

    def epoch_end(self, epoch, result):
        print("Epoch [{}], last_lr: {:.5f}, train_loss: {:.4f}, val_loss: {:.4f}, val_acc: {:.4f}".format(
            epoch, result['lrs'][-1], result['train_loss'], result['val_loss'], result['val_accuracy']))

def ConvBlock(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
             nn.BatchNorm2d(out_channels),
             nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)

class ResNet9(ImageClassificationBase):
    def __init__(self, in_channels, num_diseases):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))
        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))
        self.classifier = nn.Sequential(nn.MaxPool2d(4),
                                       nn.Flatten(),
                                       nn.Linear(512, num_diseases))

    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out

def prediction(image_path, model, class_names):
    try:
        img = Image.open(image_path).convert('RGB')
    except FileNotFoundError:
        return f"Error: Image file not found at {image_path}"

    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
    ])

    # Preprocess the image
    img_tensor = transform(img)
    
    # Add a batch dimension (models expect a batch of images)
    img_batch = img_tensor.unsqueeze(0)
    
    # Set the model to evaluation mode
    model.eval()
    
    device = next(model.parameters()).device
    img_batch = img_batch.to(device)

    # Make prediction
    with torch.no_grad():
        outputs = model(img_batch)
        _, preds = torch.max(outputs, dim=1)
        predicted_idx = preds[0].item()

    return class_names[predicted_idx]


def predict_crop_disease(image_path):
    MODEL_PATH = './models/disease prediction/plant-disease-model.pth' 
    CLASS_NAMES_PATH = './models/disease prediction/plant_disease_class_names.json'
    IMAGE_TO_PREDICT = image_path

    try:
        with open(CLASS_NAMES_PATH, 'r') as f:
            class_names = json.load(f)
    except FileNotFoundError:
        print(f"Error: Class names file not found at {CLASS_NAMES_PATH}")
        exit()
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    try:
        model = torch.load(MODEL_PATH, map_location=device, weights_only=False) # <--- UPDATED LINE
    except FileNotFoundError:
        print(f"Error: Model file not found at {MODEL_PATH}")
        exit()
    except Exception as e:
        print(f"An error occurred while loading the model: {e}")
        exit()
    prediction_result = prediction(IMAGE_TO_PREDICT, model, class_names)
    return prediction_result
