"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*you provided is a TypeScript code that sets up an Express server and defines several routes
for handling HTTP requests. */
const axios_1 = __importDefault(require("axios"));
const body_parser_1 = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./database")); // Adjust path if necessary
const ghl_1 = require("./ghl");
const cors_1 = __importDefault(require("cors"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const ws_1 = __importDefault(require("ws"));
const body_parser_2 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path = __dirname + "/ui/dist/";
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_2.default.json());
app.use((0, body_parser_1.json)({ type: "application/json" }));
app.use((0, body_parser_1.urlencoded)({ extended: true }));
// Set up CORS options if needed
const corsOptions = {
    origin: "*", // You can specify the allowed origin or use '*'
    methods: ["GET", "POST"], // Specify the allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
};
// Apply CORS middleware to all routes
app.use((0, cors_1.default)(corsOptions));
/*`app.use(express.static(path));` is setting up a middleware in the Express server. The
`express.static` middleware is used to serve static files such as HTML, CSS, JavaScript, and images. */
app.use(express_1.default.static(path));
/* The line `const ghl = new GHL();` is creating a new instance of the `GHL` class. It is assigning
this instance to the variable `ghl`. This allows you to use the methods and properties defined in
the `GHL` class to interact with the GoHighLevel API. */
const ghl = new ghl_1.GHL();
const port = process.env.PORT;
// SSL options (ensure you have valid SSL certificates)
// const sslOptions = {
//   key: fs.readFileSync("./cert/server.key"),
//   cert: fs.readFileSync("./cert/server.crt"),
//   passphrase: process.env.SSL_PASSPHRASE,
// };
// Create an HTTP server
// const server = https.createServer(sslOptions, app);
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
let clients = new Set(); // Store connected clients
wss.on("connection", function connection(ws) {
    clients.add(ws); // Add new client to the Set
    ws.on("message", function message(data) {
        console.log("received: %s", data);
    });
    ws.send("Web Socket Received data");
});
app.post("/notifications", (req, res) => {
    // const notification: NotificationPayload = req.body;
    const newData = req.body;
    // console.log("Received notification:", newData);
    // Broadcast the notification to all connected clients
    clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify(newData)); // Send notification as JSON
        }
        else {
            // Handle closed or closing connections
            clients.delete(client); // Remove closed clients from the Set
        }
    });
    res.status(200).send(newData); // Send appropriate response to client
});
/*`app.get("/authorize-handler", async (req: Request, res: Response) => { ... })` sets up an example how you can authorization requests */
app.get("/authorize-handler", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    const rs = yield ghl.authorizationHandler(code);
    try {
        const url = `https://services.leadconnectorhq.com/payments/custom-provider/provider?locationId=${rs === null || rs === void 0 ? void 0 : rs.locationId}`;
        const headers = {
            Accept: "application/json",
            Authorization: `Bearer ${rs === null || rs === void 0 ? void 0 : rs.access_token}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
        };
        const data = {
            name: "MontyPay Payment",
            description: "MontyPay allows merchants to collect payments globally with ease. Our multiple plugins, APIs, and SDKs ensure seamless integration with merchants’ websites and apps.",
            paymentsUrl: "https://funnnel-fusion.onrender.com/payment",
            queryUrl: "https://funnnel-fusion.onrender.com",
            imageUrl: "https://funnnel-fusion.onrender.com/512x512.png",
        };
        yield fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            yield ghl.addProviderConfig(result.providerConfig, rs === null || rs === void 0 ? void 0 : rs.locationId);
        }))
            .catch((error) => console.error("Error:", error));
    }
    catch (err) {
        console.error({ Error: err });
    }
    res.redirect(`https://app.gohighlevel.com/v2/location/${rs === null || rs === void 0 ? void 0 : rs.locationId}/integration/66e93c73340adb16801e16f4`);
}));
/*`app.get("/example-api-call", async (req: Request, res: Response) => { ... })` shows you how you can use ghl object to make get requests
 ghl object in abstract would handle all of the authorization part over here. */
app.get("/example-api-call", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (ghl.checkInstallationExists(req.query.companyId)) {
        try {
            const request = yield ghl
                .requests(req.query.companyId)
                .get(`/users/search?companyId=${req.query.companyId}`, {
                headers: {
                    Version: "2021-07-28",
                },
            });
            return res.send(request.data);
        }
        catch (error) {
            console.log(error);
        }
    }
    return res.send("Installation for this company does not exists");
}));
/*`app.get("/example-api-call-location", async (req: Request, res: Response) => { ... })` shows you how you can use ghl object to make get requests
 ghl object in abstract would handle all of the authorization part over here. */
app.get("/api-call-location", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /* The line `if(ghl.checkInstallationExists(req.params.locationId)){` is checking if an
      installation already exists for a specific location. It calls the `checkInstallationExists`
      method of the `GHL` class and passes the `locationId` as a parameter. This method checks if
      there is an existing installation for the provided locationId and returns a boolean value
      indicating whether the installation exists or not. */
    try {
        if (ghl.checkInstallationExists(req.params.locationId)) {
            const request = yield ghl
                .requests(req.query.locationId)
                .get(`/contacts/?locationId=${req.query.locationId}`, {
                headers: {
                    Version: "2021-07-28",
                },
            });
            return res.send(request.data);
        }
        else {
            /* NOTE: This flow would only work if you have a distribution type of both Location & Company & OAuth read-write scopes are configured.
              The line `await ghl.getLocationTokenFromCompanyToken(req.query.companyId as string, req.query.locationId as string)`
               is calling the `getLocationTokenFromCompanyToken` method of the
              `GHL` class. This method is used to retrieve the location token for a specific location within a company. */
            yield ghl.getLocationTokenFromCompanyToken(req.query.companyId, req.query.locationId);
            const request = yield ghl
                .requests(req.query.locationId)
                .get(`/contacts/?locationId=${req.query.locationId}`, {
                headers: {
                    Version: "2021-07-28",
                },
            });
            return res.send(request.data);
        }
    }
    catch (error) {
        console.log(error);
        res.send(error).status(400);
    }
}));
/*`app.post("example-webhook-handler",async (req: Request, res: Response) => {
    console.log(req.body)
})` sets up a route for handling HTTP POST requests to the "/example-webhook-handler" endpoint. The below POST
api can be used to subscribe to various webhook events configured for the app. */
app.post("/webhook-handler", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send(req.body);
}));
/* The `app.post("/decrypt-sso",async (req: Request, res: Response) => { ... })` route is used to
decrypt session details using ssoKey. */
app.post("/decrypt-sso", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { key } = req.body || {};
    if (!key) {
        return res.status(400).send("Please send valid key");
    }
    try {
        const data = ghl.decryptSSOData(key);
        res.send(data);
    }
    catch (error) {
        res.status(400).send("Invalid Key");
        console.log(error);
    }
}));
/*`app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});` sets up a route for the root URL ("/") of the server.  This is
 used to serve the main HTML file of a web application. */
app.get("/", function (req, res) {
    res.sendFile(path + "index.html");
});
app.get("/getAll", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const all = yield ghl.getAll();
    return res.send(all);
}));
// Adjust path if necessary
app.post("/save-merchant-info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { merchantKey, merchantPass, locationId } = req.body;
    const info = yield ghl.saveMerchantInfo(merchantKey, merchantPass, locationId);
    const row = yield ghl.getByLocationId(locationId);
    if (!row) {
        return res.status(500).json({ message: "Merchant Info Not Added" });
    }
    axios_1.default
        .post(`https://services.leadconnectorhq.com/payments/custom-provider/connect?locationId=${locationId}`, {
        live: {
            liveMode: true,
            apiKey: merchantKey,
            publishableKey: merchantPass,
        },
        test: {
            liveMode: false,
            apiKey: row.TestmerchantKey,
            publishableKey: row.TestmerchantPass,
        },
    }, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${row.access_token}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
        },
    })
        .then((resp) => __awaiter(void 0, void 0, void 0, function* () {
        const updateProviderConfig = yield ghl.updateProviderConfig(locationId, resp.data.providerConfig);
        console.log("Merchant Info Added");
        return res.status(200).json({ message: "Merchant Info Added" });
    }))
        .catch((err) => {
        console.log("Error", err);
    });
    // return res.status(200).json({ message: "Merchant Info Added" });
}));
app.post("/save-test-merchant-info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { TestmerchantKey, TestmerchantPass, locationId } = req.body;
    const info = yield ghl.saveTestMerchantInfo(TestmerchantKey, TestmerchantPass, locationId);
    const row = yield ghl.getByLocationId(locationId);
    if (!row) {
        return res.status(500).json({ message: "Merchant Info Not Added" });
    }
    axios_1.default
        .post(`https://services.leadconnectorhq.com/payments/custom-provider/connect?locationId=${locationId}`, {
        live: {
            liveMode: false,
            apiKey: TestmerchantKey,
            publishableKey: TestmerchantPass,
        },
        test: {
            liveMode: true,
            apiKey: TestmerchantKey,
            publishableKey: TestmerchantPass,
        },
    }, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${row.access_token}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
        },
    })
        .then((resp) => __awaiter(void 0, void 0, void 0, function* () {
        const updateProviderConfig = yield ghl.updateProviderConfig(locationId, resp.data.providerConfig);
        console.log("Merchant Info Added");
        return res
            .status(200)
            .json({ message: "Merchant Info Added", userInfo: info });
    }))
        .catch((err) => {
        console.log("Error", err);
    });
}));
app.get("/get-by-locationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const locationId = req.query.locationId;
    const info = yield ghl.getByLocationId(locationId);
    return res.status(200).json(info);
}));
app.post("/add-providerConfig", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { providerConfig, locationId } = req.body;
    const info = yield ghl.addProviderConfig(providerConfig, locationId);
}));
app.post("/getPaymentRedirectURL", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { merchant_key, merchant_pass, operation, cancel_url, success_url, order, customer, } = req.body;
    let to_md5 = order.number +
        order.amount +
        order.currency +
        order.description +
        merchant_pass;
    let hash = crypto_js_1.default.SHA1(crypto_js_1.default.MD5(to_md5.toUpperCase()).toString());
    let result = crypto_js_1.default.enc.Hex.stringify(hash);
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
        const response = yield fetch("https://checkout.montypay.com/api/v1/session", {
            method: "POST",
            body: JSON.stringify(endObject),
            headers: { "Content-Type": "application/json" },
        });
        const jsonResponse = yield response.json();
        return res.status(200).json(jsonResponse);
    }
    catch (err) {
        console.log("ERROR", err);
        return res.status(500).json(err);
    }
}));
app.get("*", (req, res) => {
    res.sendFile(path + "index.html");
});
const syncDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.sync(); // This will create the table if it doesn't exist
        console.log("Database synchronized.");
    }
    catch (error) {
        console.error("Error synchronizing the database:", error);
    }
});
syncDatabase();
server.listen(8080, () => {
    console.log("Secure WebSocket server is running on port 8080");
});
/*`app.listen(port, () => {
  console.log(`GHL app listening on port `);
});` is starting the Express server and making it listen on the specified port. */
const options = {
    key: fs_1.default.readFileSync('./cert/file.key'),
    cert: fs_1.default.readFileSync('./cert/file.crt')
};
https_1.default.createServer(options, app).listen(8081, () => {
    console.log('Secure server running on port 8081');
});
// app.listen(port, () => {
//   console.log(`GHL app listening on port ${port}`);
// });
