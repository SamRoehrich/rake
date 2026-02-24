FROM debian:stable

EXPOSE 4096

# Install base tools
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
  curl \
  bash \
  tmux \
  git \
  unzip \
  awscli \
  && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Install Opencode
RUN curl -fsSL https://opencode.ai/install | bash
ENV PATH="/root/.opencode/bin:${PATH}"

# Start opencode server
CMD ["opencode", "serve", "--hostname", "0.0.0.0", "--port", "4096"]
