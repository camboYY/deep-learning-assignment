# ===============================
# 1. Use Python base image
# ===============================
FROM python:3.11-slim

# ===============================
# 2. Set work directory
# ===============================
WORKDIR /app

# ===============================
# 3. Install system dependencies
# ===============================
# Required for torch, pillow, and image processing
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# ===============================
# 4. Copy requirements & install
# ===============================
COPY requirements.txt .

# Upgrade pip
RUN pip install --upgrade pip

# Install Python dependencies
RUN pip install -r requirements.txt

# ===============================
# 5. Copy application code
# ===============================
COPY . .

# ===============================
# 6. Expose port & run server
# ===============================
EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
