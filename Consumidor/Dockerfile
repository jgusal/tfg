FROM alpine:3.10.1
RUN apk add python3 && \
    apk add py3-pip
RUN pip3 install setuptools wheel kafka-python pymongo
RUN apk add gcc libc-dev python3-dev
COPY consumer.py /
RUN python3 -m py_compile consumer.py
