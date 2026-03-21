/**
 * Strips metadata atoms from MP4 video buffers.
 * Removes the `udta` (user data) and `meta` atoms from inside `moov`,
 * which contain title, author, creation date, copyright, etc.
 * Works without ffmpeg using pure binary parsing of the MP4 container format.
 */

function readBox(buffer: Buffer, offset: number): { size: number; type: string } | null {
  if (offset + 8 > buffer.length) return null;

  let size = buffer.readUInt32BE(offset);

  // size === 1 means 64-bit extended size (next 8 bytes)
  if (size === 1) {
    if (offset + 16 > buffer.length) return null;
    const hi = buffer.readUInt32BE(offset + 8);
    const lo = buffer.readUInt32BE(offset + 12);
    // Only handle files up to ~4GB (lo only), which covers all Instagram content
    size = hi * 0x100000000 + lo;
  }

  // size === 0 means box extends to end of file
  if (size === 0) {
    size = buffer.length - offset;
  }

  if (size < 8 || offset + size > buffer.length) return null;

  const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
  return { size, type };
}

/**
 * Walks a container box (e.g. moov) and removes specified child atom types.
 */
function stripChildAtoms(buffer: Buffer, typesToRemove: Set<string>): Buffer {
  const chunks: Buffer[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    const box = readBox(buffer, offset);
    if (!box) {
      // Preserve unreadable trailing bytes
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (!typesToRemove.has(box.type)) {
      chunks.push(buffer.subarray(offset, offset + box.size));
    }

    offset += box.size;
  }

  return Buffer.concat(chunks);
}

/**
 * Strips metadata from an MP4 buffer.
 * Removes udta and meta atoms from inside the moov container.
 */
export function stripMp4Metadata(buffer: Buffer): Buffer {
  const chunks: Buffer[] = [];
  let offset = 0;
  const METADATA_ATOMS = new Set(["udta", "meta"]);

  while (offset < buffer.length) {
    const box = readBox(buffer, offset);
    if (!box) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (box.type === "moov") {
      // Strip metadata child atoms from inside moov
      const moovPayload = buffer.subarray(offset + 8, offset + box.size);
      const cleanedPayload = stripChildAtoms(moovPayload, METADATA_ATOMS);

      // Rebuild moov with updated size
      const newSize = 8 + cleanedPayload.length;
      const newMoov = Buffer.alloc(newSize);
      newMoov.writeUInt32BE(newSize, 0);
      newMoov.write("moov", 4, "ascii");
      cleanedPayload.copy(newMoov, 8);
      chunks.push(newMoov);
    } else {
      chunks.push(buffer.subarray(offset, offset + box.size));
    }

    offset += box.size;
  }

  return Buffer.concat(chunks);
}
