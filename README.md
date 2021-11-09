**XT-Streaming Manual Build and Run**

**TCP Server**

**Build process**

- Go to xt-streaming  > tcp_server
- Open setting.json change the transcodingAddress with the remote address of  the machine which transcoding tool is running 
- Open terminal at root directory and run command

docker build -t tcp_server .

**To Run**

- docker run -dp 8000:8000 --name tcp_server tcp_server

**Transcoding Tool**

**Build process**

- Go to xt-streaming  > Video_Transcoding_tool
- Open settings/config.json change the tcpAddress with the remote address of  the machine which tcp_server  is running 
- Open terminal at root directory and run command

docker build -t transcoding_tool .

**To Run**

- docker run -dp 8085:8085 --name transcoding_tool  -v media:/home/node/media transcoding_tool

**Docker Commands**

- To list all running containers docker ps -a
- To remove docker container docker rm -f containerId 
- To show logs docker logs -f <container id>
- To inspect container files docker exec -it containerId sh
- To stop docker container docker stop containerId
- To start docker container docker start containerId
