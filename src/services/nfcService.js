import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

let nfcInitialized = false;

export async function initNfc() {
  try {
    await NfcManager.start();
    nfcInitialized = true;
    return true;
  } catch {
    nfcInitialized = false;
    return false;
  }
}

export async function isNfcSupported() {
  try {
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
}

export async function isNfcEnabled() {
  try {
    return await NfcManager.isEnabled();
  } catch {
    return false;
  }
}

/**
 * Read an NDEF tag and return the decoded text payload.
 * Resolves with the string payload, or rejects on error/cancellation.
 */
export function readNfcTag() {
  return new Promise(async (resolve, reject) => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (!tag || !tag.ndefMessage || tag.ndefMessage.length === 0) {
        throw new Error('NFC tag has no NDEF message');
      }

      const payload = decodeNdefPayload(tag.ndefMessage[0]);
      resolve(payload);
    } catch (err) {
      reject(err);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  });
}

export function cancelNfcScan() {
  try {
    NfcManager.cancelTechnologyRequest();
  } catch {
    // ignore
  }
}

function decodeNdefPayload(record) {
  if (!record || !record.payload) return '';

  try {
    // Text record: first byte is status byte, next N bytes are language code
    const payload = record.payload;
    if (record.tnf === 1 && record.type) {
      const typeStr = String.fromCharCode(...record.type);
      if (typeStr === 'T') {
        // NDEF Text record
        const statusByte = payload[0];
        const langLength = statusByte & 0x3f;
        const textBytes = payload.slice(1 + langLength);
        return Ndef.text.decodePayload(payload);
      }
      if (typeStr === 'U') {
        // NDEF URI record
        return Ndef.uri.decodePayload(payload);
      }
    }
    // Fallback: try UTF-8 decode of the full payload
    return new TextDecoder().decode(new Uint8Array(payload));
  } catch {
    // Last resort: join bytes as characters
    return String.fromCharCode(...record.payload);
  }
}

/**
 * Write a problem ID to an NDEF tag.
 * Use this to program physical problem cards.
 */
export async function writeNfcTag(problemId) {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const bytes = Ndef.encodeMessage([Ndef.textRecord(problemId)]);
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
    return true;
  } catch (err) {
    throw err;
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
}
