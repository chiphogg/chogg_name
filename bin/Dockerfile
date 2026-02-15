FROM ubuntu:24.04

# See https://github.com/rbenv/rbenv/issues/900#issuecomment-544985902
SHELL ["/bin/bash","-l","-c"]

ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install basic dependencies
RUN apt-get update && apt-get install -y curl git wget python3

# Install deps suggested by:
# https://github.com/rbenv/ruby-build/wiki#suggested-build-environment
RUN apt-get install -y \
    autoconf \
    patch \
    build-essential \
    rustc \
    libssl-dev \
    libyaml-dev \
    libreadline-dev \
    zlib1g-dev \
    libgmp-dev \
    libncurses-dev \
    libffi-dev \
    libgdbm6t64 \
    libgdbm-dev \
    libdb-dev \
    uuid-dev

# Install pandoc (prebuilt binary)
RUN wget -q https://github.com/jgm/pandoc/releases/download/3.9/pandoc-3.9-linux-amd64.tar.gz \
    && tar xzf pandoc-3.9-linux-amd64.tar.gz \
    && cp pandoc-3.9/bin/pandoc /usr/local/bin/ \
    && rm -rf pandoc-3.9 pandoc-3.9-linux-amd64.tar.gz

# Install rbenv
RUN git clone https://github.com/rbenv/rbenv.git ~/.rbenv
RUN echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.profile
RUN echo 'eval "$(rbenv init -)"' >> ~/.profile

# Install Ruby version using rbenv
RUN git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
ENV PATH=/root/.rbenv/shims:/root/.rbenv/bin:$PATH
RUN rbenv install 3.3.7
RUN rbenv local 3.3.7
RUN rbenv rehash

# Install Bundler
RUN gem install bundler

# Copy Gemfile and install gems
COPY Gemfile /site/Gemfile
WORKDIR /site
RUN bundle install

# Install R and necessary packages
RUN apt-get install -y r-base
RUN Rscript -e "install.packages('knitr')"
RUN Rscript -e "install.packages('ggplot2')"
RUN Rscript -e "install.packages('readr')"
RUN Rscript -e "install.packages('lubridate')"
RUN Rscript -e "install.packages('XML')"
RUN Rscript -e "install.packages('reshape2')"
RUN Rscript -e "install.packages('scales')"

# Give non-root users necessary permissions
RUN chmod -R a+rx /root

# Start the container with a command to execute the script
CMD ["bash"]
