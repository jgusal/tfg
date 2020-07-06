FROM ubuntu:18.04
COPY src/ /api
WORKDIR /api
RUN apt update && apt install -y python3 python3-pip
RUN pip3 install scikit-learn
RUN pip3 install sklearn
RUN pip3 install pymongo
RUN pip3 install flask
ENV LANG en_US.UTF-8
ENV LC_ALL C.UTF-8
ENTRYPOINT python3 api.py
