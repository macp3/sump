FROM python:3.12-slim

WORKDIR /app_code

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Ensure entrypoint is executable
RUN chmod +x /app_code/entrypoint.sh

# Expose port
EXPOSE 8000

# Run FastAPI via entrypoint
ENTRYPOINT ["/app_code/entrypoint.sh"]
