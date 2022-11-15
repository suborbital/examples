# Plugins within data streaming systems using E2Core and Redpanda

This demo shows how Wasm plugins can be run in response to events within a data-streaming platform. [Redpanda](https://redpanda.com/) is a Kafka-compatible streaming system that kicks ass in terms of performance, and here we're showing how E2Core plugins can be executed in response to messages within Redpanda topics.

To run the demo, make sure you have Subo, e2core, and Docker installed on your machine, and then clone this repo and visit the `data-streaming-redpanda` folder in your terminal.

1. Start Redpanda
```
make redpanda
```

2. In your first terminal, start e2core with the provided `transform-data` plugin
```
subo build --native
e2core start
```

3. In a second terminal, open a shell in the redpanda container to create the appropriate topics
```
docker exec -it redpanda-1 /bin/bash

# use the topic shown in the e2core output to create input and output topics (will be different than shown here)
rpk topic create com.suborbital.app.default.transform-data-ff7ffefdfddab425ad14c5b84a25006d7c509f2c301064906ae2250b8189737d
rpk topic create com.suborbital.app.default.transform-data-ff7ffefdfddab425ad14c5b84a25006d7c509f2c301064906ae2250b8189737d-reply

## start consuming the reply topic
rpk topic consume com.suborbital.app.default.transform-data-ff7ffefdfddab425ad14c5b84a25006d7c509f2c301064906ae2250b8189737d-reply
```

4. In a third terminal, produce some messages
```
docker exec -it redpanda-1 /bin/bash

# use the topic shown in the e2core output
echo "from redpanda" | rpk topic produce com.suborbital.app.default.transform-data-ff7ffefdfddab425ad14c5b84a25006d7c509f2c301064906ae2250b8189737d
```

Each time a message is produced in the third terminal, the output of the e2core plugin should be shown in the second terminal!