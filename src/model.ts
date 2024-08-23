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
}
