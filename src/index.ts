/*you provided is a TypeScript code that sets up an Express server and defines several routes
for handling HTTP requests. */
import axios from "axios";
// import { json, urlencoded } from "body-parser";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import sequelize from "./database"; // Adjust path if necessary
import { GHL } from "./ghl";
import cors from "cors";
import CryptoJS from "crypto-js";
import http from "http";
import https from "https";
import WebSocket, { WebSocketServer } from "ws";
import bodyParser from "body-parser";
import fs from "fs";

const path = __dirname + "/ui/dist/";

dotenv.config();
const app: Express = express();
// Apply these middlewares to parse different content types
app.use(bodyParser.json({ type: "application/json" })); // For JSON data
app.use(bodyParser.urlencoded({ extended: true })); // For URL-encoded data
app.use(bodyParser.text({ type: "text/*" })); // For plain text data
app.use(bodyParser.raw({ type: "*/*" })); // For any other data type (catch-all)

// Set up CORS options if needed
const corsOptions = {
  origin: "*", // You can specify the allowed origin or use '*'
  methods: "*", // Specify the allowed HTTP methods
  allowedHeaders: "*", // Specify allowed headers
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

/*`app.use(express.static(path));` is setting up a middleware in the Express server. The
`express.static` middleware is used to serve static files such as HTML, CSS, JavaScript, and images. */
app.use(express.static(path));

/* The line `const ghl = new GHL();` is creating a new instance of the `GHL` class. It is assigning
this instance to the variable `ghl`. This allows you to use the methods and properties defined in
the `GHL` class to interact with the GoHighLevel API. */
const ghl = new GHL();

const port = process.env.PORT;

// Create an HTTP server
// const server = https.createServer(sslOptions, app);

// Load SSL certificates
const privateKey = fs.readFileSync("./file.key", "utf8");
const certificate = fs.readFileSync("./file.crt", "utf8");
const ca = fs.readFileSync("./cabundle.crt", "utf8");

const credentials = { key: privateKey, cert: certificate, ca: ca };

// const server = http.createServer(app);
const server = https.createServer(credentials, app);
const wss = new WebSocket.Server({ server });

let clients = new Set<WebSocket>(); // Store connected clients

wss.on("connection", function connection(ws) {
  clients.add(ws); // Add new client to the Set
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });
  ws.send("Web Socket Received data");
});

app.post("/notifications", (req: Request, res: Response) => {
  const newData = req.body;
  // Broadcast the notification to all connected clients
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(newData)); // Send notification as JSON
    } else {
      // Handle closed or closing connections
      clients.delete(client); // Remove closed clients from the Set
    }
  });

  return res.status(200).json({ data: newData }); // Send appropriate response to client
});

/*`app.get("/authorize-handler", async (req: Request, res: Response) => { ... })` sets up an example how you can authorization requests */
app.get("/authorize-handler", async (req: Request, res: Response) => {
  const { code } = req.query;
  const rs = await ghl.authorizationHandler(code as string);
  try {
    const url = `https://services.leadconnectorhq.com/payments/custom-provider/provider?locationId=${rs?.locationId}`;

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${rs?.access_token}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    };

    const data = {
      name: "MontyPay Payment",
      description:
        "MontyPay allows merchants to collect payments globally with ease. Our multiple plugins, APIs, and SDKs ensure seamless integration with merchants’ websites and apps.",
      paymentsUrl: "https://lhg.montypaydev.com:8080/payment",
      queryUrl: "https://lhg.montypaydev.com:8080/verification",
      imageUrl: "https://lhg.montypaydev.com:8080/512x512.png",
    };

    await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then(async (result) => {
        console.log("Result:", result);
        await ghl.addProviderConfig(
          result.providerConfig as object,
          rs?.locationId as string
        );
      })
      .catch((error) => console.error("Error:", error));
  } catch (err) {
    console.error({ Error: err });
  }

  res.redirect(
    `https://app.gohighlevel.com/v2/location/${rs?.locationId}/integration/66e93c73340adb16801e16f4`
  );
});

/*`app.get("/example-api-call", async (req: Request, res: Response) => { ... })` shows you how you can use ghl object to make get requests
 ghl object in abstract would handle all of the authorization part over here. */
app.get("/example-api-call", async (req: Request, res: Response) => {
  if (ghl.checkInstallationExists(req.query.companyId as string)) {
    try {
      const request = await ghl
        .requests(req.query.companyId as string)
        .get(`/users/search?companyId=${req.query.companyId}`, {
          headers: {
            Version: "2021-07-28",
          },
        });
      return res.send(request.data);
    } catch (error) {
      console.log(error);
    }
  }
  return res.send("Installation for this company does not exists");
});

/*`app.get("/example-api-call-location", async (req: Request, res: Response) => { ... })` shows you how you can use ghl object to make get requests
 ghl object in abstract would handle all of the authorization part over here. */
app.get("/api-call-location", async (req: Request, res: Response) => {
  /* The line `if(ghl.checkInstallationExists(req.params.locationId)){` is checking if an
    installation already exists for a specific location. It calls the `checkInstallationExists`
    method of the `GHL` class and passes the `locationId` as a parameter. This method checks if
    there is an existing installation for the provided locationId and returns a boolean value
    indicating whether the installation exists or not. */
  try {
    if (ghl.checkInstallationExists(req.params.locationId)) {
      const request = await ghl
        .requests(req.query.locationId as string)
        .get(`/contacts/?locationId=${req.query.locationId}`, {
          headers: {
            Version: "2021-07-28",
          },
        });
      return res.send(request.data);
    } else {
      /* NOTE: This flow would only work if you have a distribution type of both Location & Company & OAuth read-write scopes are configured. 
        The line `await ghl.getLocationTokenFromCompanyToken(req.query.companyId as string, req.query.locationId as string)`
         is calling the `getLocationTokenFromCompanyToken` method of the
        `GHL` class. This method is used to retrieve the location token for a specific location within a company. */
      await ghl.getLocationTokenFromCompanyToken(
        req.query.companyId as string,
        req.query.locationId as string
      );
      const request = await ghl
        .requests(req.query.locationId as string)
        .get(`/contacts/?locationId=${req.query.locationId}`, {
          headers: {
            Version: "2021-07-28",
          },
        });
      return res.send(request.data);
    }
  } catch (error) {
    console.log(error);
    res.send(error).status(400);
  }
});

/*`app.post("example-webhook-handler",async (req: Request, res: Response) => {
    console.log(req.body)
})` sets up a route for handling HTTP POST requests to the "/example-webhook-handler" endpoint. The below POST
api can be used to subscribe to various webhook events configured for the app. */
app.post("/webhook-handler", async (req: Request, res: Response) => {
  return res.send(req.body);
});

/* The `app.post("/decrypt-sso",async (req: Request, res: Response) => { ... })` route is used to
decrypt session details using ssoKey. */
app.post("/decrypt-sso", async (req: Request, res: Response) => {
  const { key } = req.body || {};
  if (!key) {
    return res.status(400).send("Please send valid key");
  }
  try {
    const data = ghl.decryptSSOData(key);
    res.send(data);
  } catch (error) {
    res.status(400).send("Invalid Key");
    console.log(error);
  }
});

/*`app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});` sets up a route for the root URL ("/") of the server.  This is
 used to serve the main HTML file of a web application. */
app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

app.get("/getAll", async (req: Request, res: Response) => {
  const all = await ghl.getAll();
  return res.send(all);
});
// Adjust path if necessary

app.post("/save-merchant-info", async (req: Request, res: Response) => {
  const { merchantKey, merchantPass, locationId } = req.body;
  const info = await ghl.saveMerchantInfo(
    merchantKey,
    merchantPass,
    locationId
  );
  const row = await ghl.getByLocationId(locationId as string);
  if (!row) {
    return res.status(500).json({ message: "Merchant Info Not Added" });
  }
  axios
    .post(
      `https://services.leadconnectorhq.com/payments/custom-provider/connect?locationId=${locationId}`,
      {
        live: {
          liveMode: true,
          apiKey: merchantPass,
          publishableKey: merchantKey,
        },
        test: {
          liveMode: false,
          apiKey: row.TestmerchantPass,
          publishableKey: row.TestmerchantKey,
        },
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${row.access_token}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
      }
    )
    .then(async (resp) => {
      const updateProviderConfig = await ghl.updateProviderConfig(
        locationId as string,
        resp.data.providerConfig as object
      );
      console.log("Merchant Info Added");
      return res.status(200).json({ message: "Merchant Info Added" });
    })
    .catch((err) => {
      console.log("Error", err);
    });
  // return res.status(200).json({ message: "Merchant Info Added" });
});
app.post("/save-test-merchant-info", async (req: Request, res: Response) => {
  const { TestmerchantKey, TestmerchantPass, locationId } = req.body;
  const info = await ghl.saveTestMerchantInfo(
    TestmerchantKey,
    TestmerchantPass,
    locationId
  );
  const row = await ghl.getByLocationId(locationId as string);
  if (!row) {
    return res.status(500).json({ message: "Merchant Info Not Added" });
  }
  axios
    .post(
      `https://services.leadconnectorhq.com/payments/custom-provider/connect?locationId=${locationId}`,
      {
        live: {
          liveMode: false,
          apiKey: TestmerchantPass,
          publishableKey: TestmerchantKey,
        },
        test: {
          liveMode: true,
          apiKey: row.TestmerchantPass,
          publishableKey: row.TestmerchantKey,
        },
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${row.access_token}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
      }
    )
    .then(async (resp) => {
      const updateProviderConfig = await ghl.updateProviderConfig(
        locationId as string,
        resp.data.providerConfig as object
      );
      console.log("Merchant Info Added");
      return res.status(200).json({ message: "Merchant Info Added" });
    })
    .catch((err) => {
      console.log("Error", err);
    });
  // return res.status(200).json({ message: "Merchant Info Added" });
});

app.get("/get-by-locationId", async (req: Request, res: Response) => {
  const locationId = req.query.locationId;
  const info = await ghl.getByLocationId(locationId as string);
  return res.status(200).json(info);
});

app.post("/add-providerConfig", async (req: Request, res: Request) => {
  const { providerConfig, locationId } = req.body;
  const info = await ghl.addProviderConfig(
    providerConfig as object,
    locationId as string
  );
});

app.post("/getPaymentRedirectURL", async (req: Request, res: Response) => {
  const {
    merchant_key,
    merchant_pass,
    operation,
    cancel_url,
    success_url,
    order,
    customer,
  } = req.body;

  let to_md5 =
    order.number +
    order.amount +
    order.currency +
    order.description +
    merchant_pass;

  let hash = CryptoJS.SHA1(CryptoJS.MD5(to_md5.toUpperCase()).toString());
  let result = CryptoJS.enc.Hex.stringify(hash);
  const endObject = {
    merchant_key: merchant_key,
    merchant_pass: merchant_pass,
    operation: operation,
    cancel_url: cancel_url,
    success_url: success_url,
    hash: `${result}`,
    order: {
      description: order.description,
      number: order.number,
      amount: order.amount,
      currency: order.currency,
    },
    customer: {
      name: customer.name,
      email: customer.email,
    },
  };
  try {
    const response = await fetch(
      "https://checkout.montypay.com/api/v1/session",
      {
        method: "POST",
        body: JSON.stringify(endObject),
        headers: { "Content-Type": "application/json" },
      }
    );
    const jsonResponse = await response.json();
    return res.status(200).json(jsonResponse);
  } catch (err) {
    console.log("ERROR", err);
    return res.status(500).json(err);
  }
});

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path + "index.html");
});

app.post("/verification", (req: Request, res: Response) => {
  const newData = req.body;
  console.log("Verification: ", newData);
  // Broadcast the notification to all connected clients
  // clients.forEach((client) => {
  //   if (client.readyState === WebSocket.OPEN) {
  //     client.send(JSON.stringify({ Verification: newData })); // Send notification as JSON
  //   } else {
  //     // Handle closed or closing connections
  //     clients.delete(client); // Remove closed clients from the Set
  //   }
  // });
});

const syncDatabase = async () => {
  try {
    await sequelize.sync(); // This will create the table if it doesn't exist
    console.log("Database synchronized.");
  } catch (error) {
    console.error("Error synchronizing the database:", error);
  }
};

syncDatabase();

server.listen(8081, () => {
  console.log("Secure WebSocket server is running on port 8081");
});

// const options = {
//   key: fs.readFileSync("./file.key"),
//   cert: fs.readFileSync("./file.crt"),
// };

https.createServer(credentials, app).listen(8080, () => {
  console.log("Secure server running on port 8080");
});

// app.listen(8081, () => {
//   console.log(`GHL app listening on port 8081`);
// });
