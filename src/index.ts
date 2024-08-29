/*you provided is a TypeScript code that sets up an Express server and defines several routes
for handling HTTP requests. */
import axios from "axios";
import { json } from "body-parser";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import sequelize from "./database"; // Adjust path if necessary
import { GHL } from "./ghl";

const path = __dirname + "/ui/dist/";

dotenv.config();
const app: Express = express();
app.use(json({ type: "application/json" }));

/*`app.use(express.static(path));` is setting up a middleware in the Express server. The
`express.static` middleware is used to serve static files such as HTML, CSS, JavaScript, and images. */
app.use(express.static(path));

/* The line `const ghl = new GHL();` is creating a new instance of the `GHL` class. It is assigning
this instance to the variable `ghl`. This allows you to use the methods and properties defined in
the `GHL` class to interact with the GoHighLevel API. */
const ghl = new GHL();

const port = process.env.PORT;

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
      paymentsUrl: "https://funnnel-fusion.onrender.com/payment",
      queryUrl: "https://funnnel-fusion.onrender.com",
      imageUrl: "https://funnnel-fusion.onrender.com/logo.png",
    };

    await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then(async (result) => {
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
    `https://app.gohighlevel.com/v2/location/${rs?.locationId}/integration/66784c7a116a7182d1c49bc5`
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
          apiKey: merchantKey,
          publishableKey: merchantPass,
        },
        test: {
          apiKey: row.TestmerchantKey,
          publishableKey: row.TestmerchantPass,
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
          apiKey: row.merchantKey,
          publishableKey: row.merchantPass,
        },
        test: {
          apiKey: TestmerchantKey,
          publishableKey: TestmerchantPass,
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
      return res
        .status(200)
        .json({ message: "Merchant Info Added", userInfo: info });
    });
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

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path + "index.html");
});

// Continue Here

const syncDatabase = async () => {
  try {
    await sequelize.sync(); // This will create the table if it doesn't exist
    console.log("Database synchronized.");
  } catch (error) {
    console.error("Error synchronizing the database:", error);
  }
};

syncDatabase();

/*`app.listen(port, () => {
  console.log(`GHL app listening on port `);
});` is starting the Express server and making it listen on the specified port. */
app.listen(port, () => {
  console.log(`GHL app listening on port ${port}`);
});
