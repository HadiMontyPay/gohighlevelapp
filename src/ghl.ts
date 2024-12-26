import qs from "qs";
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import CryptoJS from "crypto-js";
import { Model, TokenType } from "./model";

/* The GHL class is responsible for handling authorization, making API requests, and managing access
tokens and refresh tokens for a specific resource. */
export class GHL {
  public model: Model;

  constructor() {
    this.model = new Model();
  }

  async authorizationHandler(code: string) {
    if (!code) {
      console.warn(
        "Please provide code when making call to authorization Handler"
      );
    }
    return await this.generateAccessTokenRefreshTokenPair(code);
  }

  decryptSSOData(key: string) {
    const data = CryptoJS.AES.decrypt(
      key,
      process.env.GHL_APP_SSO_KEY as string
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
  }
  requests(resourceId: string) {
    const baseUrl = process.env.GHL_API_DOMAIN;

    if (!this.model.getAccessToken(resourceId)) {
      throw new Error("Installation not found for the following resource");
    }

    const axiosInstance = axios.create({
      baseURL: baseUrl,
    });

    axiosInstance.interceptors.request.use(
      async (requestConfig: InternalAxiosRequestConfig) => {
        try {
          requestConfig.headers["Authorization"] = `${
            TokenType.Bearer
          } ${this.model.getAccessToken(resourceId)}`;
        } catch (e) {
          console.error(e);
        }
        return requestConfig;
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          return this.refreshAccessToken(resourceId).then(() => {
            originalRequest.headers.Authorization = `Bearer ${this.model.getAccessToken(
              resourceId
            )}`;
            return axios(originalRequest);
          });
        }

        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }

  checkInstallationExists(resourceId: string) {
    return !!this.model.getAccessToken(resourceId);
  }

  async getLocationTokenFromCompanyToken(
    companyId: string,
    locationId: string
  ) {
    const res = await this.requests(companyId).post(
      "/oauth/locationToken",
      {
        companyId,
        locationId,
      },
      {
        headers: {
          Version: "2021-07-28",
        },
      }
    );
    this.model.saveInstallationInfo(res.data);
  }

  getAll() {
    return this.model.getAll();
  }

  saveMerchantInfo(
    merchantKey: string,
    merchantPass: string,
    locationId: string
  ) {
    return this.model.saveMerchantInfo(merchantKey, merchantPass, locationId);
  }
  saveTestMerchantInfo(
    TestmerchantKey: string,
    TestmerchantPass: string,
    locationId: string
  ) {
    return this.model.saveTestMerchantInfo(
      TestmerchantKey,
      TestmerchantPass,
      locationId
    );
  }

  checkForExistingMerchantInfo(merchantKey: string, merchantPass: string) {
    return this.model.checkForExistingMerchantInfo(merchantKey, merchantPass);
  }

  checkForExistingTestMerchantInfo(
    TestmerchantKey: string,
    TestmerchantPass: string
  ) {
    return this.model.checkForExistingTestMerchantInfo(
      TestmerchantKey,
      TestmerchantPass
    );
  }

  getByLocationId(locationId: string) {
    return this.model.getByLocationId(locationId);
  }

  addProviderConfig(providerConfig: object, locationId: string) {
    return this.model.addProviderConfig(providerConfig, locationId);
  }

  updateProviderConfig(locationId: string, providerConfig: object) {
    return this.model.updateProviderConfig(locationId, providerConfig);
  }

  deleteInstallationInfo(locationId: string) {
    return this.model.deleteInstallationInfo(locationId);
  }

  private async refreshAccessToken(resourceId: string) {
    try {
      const resp = await axios.post(
        `${process.env.GHL_API_DOMAIN}/oauth/token`,
        qs.stringify({
          client_id: process.env.GHL_APP_CLIENT_ID,
          client_secret: process.env.GHL_APP_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: this.model.getRefreshToken(resourceId),
        }),
        { headers: { "content-type": "application/x-www-form-urlencoded" } }
      );
      this.model.setAccessToken(resourceId, resp.data.access_token);
      this.model.setRefreshToken(resourceId, resp.data.refresh_token);
    } catch (error: any) {
      console.error(error?.response?.data);
    }
  }

  private async generateAccessTokenRefreshTokenPair(code: string) {
    try {
      const resp = await axios.post(
        `${process.env.GHL_API_DOMAIN}/oauth/token`,
        qs.stringify({
          client_id: process.env.GHL_APP_CLIENT_ID,
          client_secret: process.env.GHL_APP_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
        }),
        { headers: { "content-type": "application/x-www-form-urlencoded" } }
      );
      return this.model.saveInstallationInfo(resp.data);
    } catch (error: any) {
      console.error(error?.response?.data);
    }
  }
}
