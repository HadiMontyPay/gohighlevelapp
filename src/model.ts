import InstallationDetails from "./installationDetailsModel"; // Adjust path if necessary

export enum AppUserType {
  Company = "Company",
  Location = "Location",
}

export enum TokenType {
  Bearer = "Bearer",
}

export class Model {
  async saveInstallationInfo(details: InstallationDetails) {
    await InstallationDetails.upsert(details); // Upsert will create or update the record

    return InstallationDetails.findOne({
      where: { locationId: details.locationId },
    });
  }

  async getAccessToken(resourceId: string): Promise<string | null> {
    const record = await InstallationDetails.findOne({
      where: { companyId: resourceId },
    });
    return record?.access_token ?? null;
  }

  async setAccessToken(resourceId: string, token: string) {
    await InstallationDetails.update(
      { access_token: token },
      { where: { companyId: resourceId } }
    );
  }

  async getRefreshToken(resourceId: string): Promise<string | null> {
    const record = await InstallationDetails.findOne({
      where: { companyId: resourceId },
    });
    return record?.refresh_token ?? null;
  }

  async setRefreshToken(resourceId: string, token: string) {
    await InstallationDetails.update(
      { refresh_token: token },
      { where: { companyId: resourceId } }
    );
  }

  async getAll() {
    await InstallationDetails.findAll();
  }

  async saveMerchantInfo(
    merchantKey: string,
    merchantPass: string,
    locationId: string
  ) {
    await InstallationDetails.update(
      { merchantKey: merchantKey, merchantPass: merchantPass },
      { where: { locationId: locationId } }
    );
  }
  async saveTestMerchantInfo(
    TestmerchantKey: string,
    TestmerchantPass: string,
    locationId: string
  ) {
    await InstallationDetails.update(
      { TestmerchantKey: TestmerchantKey, TestmerchantPass: TestmerchantPass },
      { where: { locationId: locationId } }
    );
    return await InstallationDetails.findOne({
      where: {
        locationId: locationId,
      },
    });
  }

  async getByLocationId(locationId: string) {
    return await InstallationDetails.findOne({
      where: { locationId: locationId },
    });
  }

  async addProviderConfig(providerConfig: object, locationId: string) {
    return await InstallationDetails.update(
      { providerConfig: providerConfig },
      { where: { locationId: locationId } }
    );
  }

  async updateProviderConfig(locationId: string, providerConfig: object) {
    return await InstallationDetails.update(
      { providerConfig: providerConfig },
      { where: { locationId: locationId } }
    );
  }

  async deleteInstallationInfo(locationId: string) {
    return await InstallationDetails.destroy({
      where: {
        locationId: locationId,
      },
    });
  }

  async checkForExistingMerchantInfo(
    merchantKey: string,
    merchantPass: string
  ) {
    const existingInstallation = await InstallationDetails.findOne({
      where: {
        merchantKey: merchantKey,
        merchantPass: merchantPass,
      },
    });
    if (existingInstallation) {
      return true;
    } else {
      return false;
    }
  }

  async checkForExistingTestMerchantInfo(
    TestmerchantKey: string,
    TestmerchantPass: string
  ) {
    const existingInstallation = await InstallationDetails.findOne({
      where: {
        TestmerchantKey: TestmerchantKey,
        TestmerchantPass: TestmerchantPass,
      },
    });
    if (existingInstallation) {
      return true;
    } else {
      return false;
    }
  }
}
