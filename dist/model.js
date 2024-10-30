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
exports.Model = exports.TokenType = exports.AppUserType = void 0;
const installationDetailsModel_1 = __importDefault(require("./installationDetailsModel")); // Adjust path if necessary
var AppUserType;
(function (AppUserType) {
    AppUserType["Company"] = "Company";
    AppUserType["Location"] = "Location";
})(AppUserType || (exports.AppUserType = AppUserType = {}));
var TokenType;
(function (TokenType) {
    TokenType["Bearer"] = "Bearer";
})(TokenType || (exports.TokenType = TokenType = {}));
class Model {
    saveInstallationInfo(details) {
        return __awaiter(this, void 0, void 0, function* () {
            yield installationDetailsModel_1.default.upsert(details); // Upsert will create or update the record
            return installationDetailsModel_1.default.findOne({
                where: { locationId: details.locationId },
            });
        });
    }
    getAccessToken(resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const record = yield installationDetailsModel_1.default.findOne({
                where: { companyId: resourceId },
            });
            return (_a = record === null || record === void 0 ? void 0 : record.access_token) !== null && _a !== void 0 ? _a : null;
        });
    }
    setAccessToken(resourceId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield installationDetailsModel_1.default.update({ access_token: token }, { where: { companyId: resourceId } });
        });
    }
    getRefreshToken(resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const record = yield installationDetailsModel_1.default.findOne({
                where: { companyId: resourceId },
            });
            return (_a = record === null || record === void 0 ? void 0 : record.refresh_token) !== null && _a !== void 0 ? _a : null;
        });
    }
    setRefreshToken(resourceId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield installationDetailsModel_1.default.update({ refresh_token: token }, { where: { companyId: resourceId } });
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield installationDetailsModel_1.default.findAll();
        });
    }
    saveMerchantInfo(merchantKey, merchantPass, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield installationDetailsModel_1.default.update({ merchantKey: merchantKey, merchantPass: merchantPass }, { where: { locationId: locationId } });
        });
    }
    saveTestMerchantInfo(TestmerchantKey, TestmerchantPass, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield installationDetailsModel_1.default.update({ TestmerchantKey: TestmerchantKey, TestmerchantPass: TestmerchantPass }, { where: { locationId: locationId } });
            return yield installationDetailsModel_1.default.findOne({
                where: {
                    locationId: locationId,
                },
            });
        });
    }
    getByLocationId(locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield installationDetailsModel_1.default.findOne({
                where: { locationId: locationId },
            });
        });
    }
    addProviderConfig(providerConfig, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield installationDetailsModel_1.default.update({ providerConfig: providerConfig }, { where: { locationId: locationId } });
        });
    }
    updateProviderConfig(locationId, providerConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield installationDetailsModel_1.default.update({ providerConfig: providerConfig }, { where: { locationId: locationId } });
        });
    }
}
exports.Model = Model;
