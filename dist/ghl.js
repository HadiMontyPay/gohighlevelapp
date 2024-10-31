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
exports.GHL = void 0;
const qs_1 = __importDefault(require("qs"));
const axios_1 = __importDefault(require("axios"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const model_1 = require("./model");
/* The GHL class is responsible for handling authorization, making API requests, and managing access
tokens and refresh tokens for a specific resource. */
class GHL {
    constructor() {
        this.model = new model_1.Model();
    }
    authorizationHandler(code) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!code) {
                console.warn("Please provide code when making call to authorization Handler");
            }
            return yield this.generateAccessTokenRefreshTokenPair(code);
        });
    }
    decryptSSOData(key) {
        const data = crypto_js_1.default.AES.decrypt(key, process.env.GHL_APP_SSO_KEY).toString(crypto_js_1.default.enc.Utf8);
        return JSON.parse(data);
    }
    requests(resourceId) {
        const baseUrl = process.env.GHL_API_DOMAIN;
        if (!this.model.getAccessToken(resourceId)) {
            throw new Error("Installation not found for the following resource");
        }
        const axiosInstance = axios_1.default.create({
            baseURL: baseUrl,
        });
        axiosInstance.interceptors.request.use((requestConfig) => __awaiter(this, void 0, void 0, function* () {
            try {
                requestConfig.headers["Authorization"] = `${model_1.TokenType.Bearer} ${this.model.getAccessToken(resourceId)}`;
            }
            catch (e) {
                console.error(e);
            }
            return requestConfig;
        }));
        axios_1.default.interceptors.response.use((response) => response, (error) => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                return this.refreshAccessToken(resourceId).then(() => {
                    originalRequest.headers.Authorization = `Bearer ${this.model.getAccessToken(resourceId)}`;
                    return (0, axios_1.default)(originalRequest);
                });
            }
            return Promise.reject(error);
        });
        return axiosInstance;
    }
    checkInstallationExists(resourceId) {
        return !!this.model.getAccessToken(resourceId);
    }
    getLocationTokenFromCompanyToken(companyId, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.requests(companyId).post("/oauth/locationToken", {
                companyId,
                locationId,
            }, {
                headers: {
                    Version: "2021-07-28",
                },
            });
            this.model.saveInstallationInfo(res.data);
        });
    }
    getAll() {
        return this.model.getAll();
    }
    saveMerchantInfo(merchantKey, merchantPass, locationId) {
        return this.model.saveMerchantInfo(merchantKey, merchantPass, locationId);
    }
    saveTestMerchantInfo(TestmerchantKey, TestmerchantPass, locationId) {
        return this.model.saveTestMerchantInfo(TestmerchantKey, TestmerchantPass, locationId);
    }
    getByLocationId(locationId) {
        return this.model.getByLocationId(locationId);
    }
    addProviderConfig(providerConfig, locationId) {
        return this.model.addProviderConfig(providerConfig, locationId);
    }
    updateProviderConfig(locationId, providerConfig) {
        return this.model.updateProviderConfig(locationId, providerConfig);
    }
    refreshAccessToken(resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const resp = yield axios_1.default.post(`${process.env.GHL_API_DOMAIN}/oauth/token`, qs_1.default.stringify({
                    client_id: process.env.GHL_APP_CLIENT_ID,
                    client_secret: process.env.GHL_APP_CLIENT_SECRET,
                    grant_type: "refresh_token",
                    refresh_token: this.model.getRefreshToken(resourceId),
                }), { headers: { "content-type": "application/x-www-form-urlencoded" } });
                this.model.setAccessToken(resourceId, resp.data.access_token);
                this.model.setRefreshToken(resourceId, resp.data.refresh_token);
            }
            catch (error) {
                console.error((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
            }
        });
    }
    generateAccessTokenRefreshTokenPair(code) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const resp = yield axios_1.default.post(`${process.env.GHL_API_DOMAIN}/oauth/token`, qs_1.default.stringify({
                    client_id: process.env.GHL_APP_CLIENT_ID,
                    client_secret: process.env.GHL_APP_CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code,
                }), { headers: { "content-type": "application/x-www-form-urlencoded" } });
                return this.model.saveInstallationInfo(resp.data);
            }
            catch (error) {
                console.error((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
            }
        });
    }
}
exports.GHL = GHL;
