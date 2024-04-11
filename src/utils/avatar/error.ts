import { BaseError } from "viem";

export class EnsAvatarInvalidMetadataError extends BaseError {
  override name = "EnsAvatarInvalidMetadataError";
  constructor({ data }: { data: any }) {
    super(
      "Unable to extract image from metadata. The metadata may be malformed or invalid.",
      {
        metaMessages: [
          "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
          "",
          `Provided data: ${JSON.stringify(data)}`,
        ],
      }
    );
  }
}
