

FROM python:3.11-slim


ENV PYTHONUNBUFFERED=1


WORKDIR /vasenvolt/backend

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*


COPY backend/requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt || true


RUN useradd -ms /bin/bash vscode \
    && echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
USER vscode   


CMD ["sleep", "infinity"]


 
