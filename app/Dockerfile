FROM python:3.10-slim

# Create the directory
RUN mkdir -p /usr/src/app/

# Copy requirements.txt to the directory
COPY requirements.txt /usr/src/app/

# Install dependencies in the virtual environment
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /usr/src/app/requirements.txt
