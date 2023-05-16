# Use the official Ruby image as the base
FROM ubuntu:22.04

# See https://github.com/rbenv/rbenv/issues/900#issuecomment-544985902
SHELL ["/bin/bash","-l","-c"]

ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install basic dependencies
RUN apt-get update && apt-get install -y curl git

# Install deps suggested by:
# https://github.com/rbenv/ruby-build/wiki#suggested-build-environment
RUN apt-get install -y \
    autoconf \
    patch \
    build-essential \
    rustc \
    libssl-dev \
    libyaml-dev \
    libreadline6-dev \
    zlib1g-dev \
    libgmp-dev \
    libncurses5-dev \
    libffi-dev \
    libgdbm6 \
    libgdbm-dev \
    libdb-dev \
    uuid-dev

# Install pandoc
RUN apt-get install -y haskell-platform
RUN apt-get install -y pkg-config
RUN cabal update
RUN cabal install pandoc
RUN cabal install pandoc-cli
ENV PATH /root/.cabal/bin:$PATH

# Install rbenv
RUN git clone https://github.com/rbenv/rbenv.git ~/.rbenv
RUN echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.profile
RUN echo 'eval "$(rbenv init -)"' >> ~/.profile

# Install Ruby version using rbenv
RUN git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
ENV PATH /root/.rbenv/shims:/root/.rbenv/bin:$PATH
RUN rbenv install 3.2.2
RUN rbenv local 3.2.2
RUN rbenv rehash

# Install Bundler and Nanoc
RUN gem install bundler
RUN gem install nanoc

# Install other gems I've used for blogging
RUN gem install haml
RUN gem install pandoc-ruby
RUN gem install pygments.rb
RUN gem install adsf
RUN gem install nokogiri

# Install R and necessary packages
RUN apt-get install -y r-base
RUN Rscript -e "install.packages('knitr')"
RUN Rscript -e "install.packages('ggplot2')"
RUN Rscript -e "install.packages('readr')"
RUN Rscript -e "install.packages('lubridate')"
RUN Rscript -e "install.packages('XML')"
RUN Rscript -e "install.packages('reshape2')"
RUN Rscript -e "install.packages('scales')"

# Set the working directory
WORKDIR /site

# Give non-root users necessary permissions
RUN chmod -R a+rx /root

# Start the container with a command to execute the script
CMD ["bash"]
