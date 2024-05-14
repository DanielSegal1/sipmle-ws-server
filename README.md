stage 1: create a client which connects to the server and prints the messages from the server
stage 2: make sure that if the server disconnects the client randomly, we reconnect ASAP
stage 3: Openshift disconnects every connection which is active for more than 10 minutes. we need to make sure that we don't lose data due to this
stage 4: make your code generic in a way that future ws connections to other services could use the same logic. you have free choice in what you think worth being generic and what doesn't.
stage 5: if you havent already did, take into account the fact that message handling is async which means that we cant disconnect the old connection when we send SUBSCRIBE from the new connection. if you need to make changes in the server, ask for it.