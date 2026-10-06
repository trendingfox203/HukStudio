import type { ResolvedVendor } from "@/lib/blog";

export default function VendorCredits({ vendors }: { vendors: ResolvedVendor[] }) {
  if (vendors.length === 0) return null;

  return (
    <div className="pt-4 mx-auto flex max-w-2xl flex-col items-center px-6 pb-14 text-center sm:px-12">
      <p className="font-aboreto text-sm text-black">Vendors</p>
      <div className="flex flex-col gap-1">
        {vendors.map((vendor, index) => (
          <p key={index} className="font-aboreto text-sm font-light text-black">
            {vendor.label}
            {vendor.value ? `: ${vendor.value}` : ":"}
          </p>
        ))}
      </div>
    </div>
  );
}
