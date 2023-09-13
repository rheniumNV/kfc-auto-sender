import { Neos, NeosType } from "neos-client";

const { NEOS_USERNAME, NEOS_PASSWORD } = process.env;

if (!NEOS_USERNAME || !NEOS_PASSWORD) {
  throw new Error(
    "NEOS_USERNAME or NEOS_PASSWORD is not set in the environment variables"
  );
}

const neos = new Neos(
  {
    username: NEOS_USERNAME,
    password: NEOS_PASSWORD,
  },
  { useEvents: true, autoSync: true }
);

neos.on("FriendRequested", async (friend: NeosType.Friend.NeosFriend) => {
  try {
    await neos.sendKFC({ targetUserId: friend.id, amount: 0.001 });
    await neos.addFriend({ targetUserId: friend.id });
    console.info(`Accepted friend request from ${friend.id}.and sent KFC`);
  } catch (e) {
    console.log(e);
  }
});

neos.on("MessageReceived", async (message: NeosType.Message.Message) => {
  if (message.content === "ping") {
    await neos
      .sendTextMessage({
        targetUserId: message.senderId,
        message: "pong",
      })
      .catch(console.error);
    console.info(`Sent pong to ${message.senderId}`);
  } else {
    await neos.sendKFC({ targetUserId: message.senderId, amount: 0.001 });
    console.info(`Sent KFC to ${message.senderId}`);
  }
});

neos.on("Login", async () => {
  console.info("Logged in");
  try {
    const friends = await neos.getFriends();
    await Promise.all(
      friends.map(async (friend) => {
        if (friend.friendStatus !== "Accepted") {
          await neos.sendKFC({ targetUserId: friend.id, amount: 0.001 });
          await neos.addFriend({ targetUserId: friend.id });
          console.info(
            `Accepted friend request from ${friend.id}.and sent KFC`
          );
        }
      })
    );
  } catch (e) {
    console.log(e);
  }
});

setInterval(async () => {
  try {
    await neos.updateUserStatus({
      status: { onlineStatus: "Online", neosVersion: "KFC AutoSender" },
    });
  } catch (e) {
    console.log(e);
  }
}, 60000);

neos.login();
