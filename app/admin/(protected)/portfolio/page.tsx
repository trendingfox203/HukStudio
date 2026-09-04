import Image from "next/image";
import type { Metadata } from "next";
import { db, isDbConfigured } from "@/lib/db";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import PortfolioCategorySection from "@/components/admin/PortfolioCategorySection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import SortableGrid from "@/components/admin/SortableGrid";
import ActionForm from "@/components/admin/ActionForm";
import EditDialog from "@/components/admin/EditDialog";
import MediaCard from "@/components/admin/MediaCard";
import { TextInput, TextArea, SelectInput } from "@/components/admin/FormControls";
import { TrashIcon, GripIcon } from "@/components/admin/icons";
import {
  updatePortfolioHero,
  addHeroImages,
  deleteHeroImage,
  reorderHeroImages,
  addReview,
  updateReview,
  deleteReview,
  reorderReviews,
  type PortfolioCategory,
} from "./actions";

export const metadata: Metadata = { title: "Quản trị — Portfolio" };

type ItemRow = {
  id: string;
  category: PortfolioCategory;
  name: string;
  venue: string;
  public_url: string;
  external_url: string;
  sort_order: number;
};

type ReviewRow = {
  id: string;
  quote: string;
  author: string;
  platform: string;
  rating: number;
  avatar_url: string | null;
  sort_order: number;
};

type HeroValue = {
  label?: string;
  tagline?: string;
  subtitle?: string;
  headlineBefore?: string;
  headlineAccent?: string;
  headlineAfter?: string;
};

type HeroImageRow = { id: string; public_url: string; alt_text: string; sort_order: number };

function RatingOptions() {
  return (
    <>
      {[5, 4, 3, 2, 1].map((n) => (
        <option key={n} value={n}>
          {"★".repeat(n)} ({n})
        </option>
      ))}
    </>
  );
}

export default async function AdminPortfolioPage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const client = db();

  const [{ rows: items }, { rows: reviews }, heroResult, { rows: heroImages }] =
    await Promise.all([
      client.query<ItemRow>(
        `select id, category, name, venue, public_url, external_url, sort_order
         from portfolio_items order by sort_order asc`,
      ),
      client.query<ReviewRow>(
        `select id, quote, author, platform, rating, avatar_url, sort_order
         from portfolio_reviews order by sort_order asc`,
      ),
      client.query(`select value from site_settings where key = 'portfolio_hero'`),
      client.query<HeroImageRow>(
        `select id, public_url, alt_text, sort_order
         from portfolio_hero_images order by sort_order asc`,
      ),
    ]);

  const hero = (heroResult.rows[0]?.value ?? {}) as HeroValue;
  const heroImageRows = heroImages;
  const byCategory = (category: PortfolioCategory) =>
    items.filter((item) => item.category === category);
  const reviewRows = reviews;

  return (
    <div className="flex flex-col gap-12">
      <AdminPageHeader title="Portfolio" description="Ảnh nền Hero, các project và review khách hàng." />

      <section id="hero" className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-ink">Hero (dải ảnh + tiêu đề)</h2>

        <Card>
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">Nội dung chữ</h3>
          <ActionForm action={updatePortfolioHero} submitLabel="Lưu Hero" pendingLabel="Đang lưu...">
            <TextInput
              label="Nhãn nhỏ (vd: Portfolio)"
              name="label"
              defaultValue={hero.label}
            />
            <TextInput
              label="Tagline (dòng hoa, in đậm)"
              name="tagline"
              defaultValue={hero.tagline}
            />
            <TextInput label="Dòng phụ (chữ nghiêng)" name="subtitle" defaultValue={hero.subtitle} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextInput
                label="Tiêu đề (trước)"
                name="headlineBefore"
                defaultValue={hero.headlineBefore}
                placeholder="THE ART"
              />
              <TextInput
                label="Từ nhấn (chữ script)"
                name="headlineAccent"
                defaultValue={hero.headlineAccent}
                placeholder="of"
              />
              <TextInput
                label="Tiêu đề (sau)"
                name="headlineAfter"
                defaultValue={hero.headlineAfter}
                placeholder="WEDDING"
              />
            </div>
          </ActionForm>
        </Card>

        <p className="text-sm font-medium tracking-wide text-ink/70 uppercase">
          Dải ảnh carousel
        </p>
        {heroImageRows.length === 0 ? (
          <p className="text-sm text-ink/50">Chưa có ảnh nào. Thêm ảnh đầu tiên ở dưới.</p>
        ) : (
          <SortableGrid
            items={heroImageRows.map((image) => ({
              id: image.id,
              node: (
                <MediaCard
                  src={image.public_url}
                  alt={image.alt_text}
                  aspect="aspect-[4/5]"
                  deleteAction={deleteHeroImage.bind(null, image.id)}
                />
              ),
            }))}
            onReorder={reorderHeroImages}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          />
        )}
        <Card>
          <ActionForm action={addHeroImages} submitLabel="Thêm ảnh" pendingLabel="Đang lưu...">
            <MultiImageUploadField folder="portfolio" label="Ảnh (chọn nhiều)" />
          </ActionForm>
        </Card>
      </section>

      <PortfolioCategorySection category="press" heading="Press" items={byCategory("press")} />
      <PortfolioCategorySection
        category="galleries"
        heading="Wedding Galleries"
        items={byCategory("galleries")}
      />
      <PortfolioCategorySection
        category="editorials"
        heading="Editorial"
        items={byCategory("editorials")}
      />

      <section id="reviews" className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-ink">Reviews</h2>

        {reviewRows.length === 0 ? (
          <p className="text-sm text-ink/50">Chưa có review nào.</p>
        ) : (
          <SortableGrid
            items={reviewRows.map((review) => ({
              id: review.id,
              node: (
                <Card className="flex cursor-grab items-center gap-4 active:cursor-grabbing">
                  <GripIcon className="h-4 w-4 shrink-0 text-ink/30" />
                  {review.avatar_url && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={review.avatar_url}
                        alt={review.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm italic text-ink/90">&ldquo;{review.quote}&rdquo;</p>
                    <p className="mt-1 text-xs text-ink/60">
                      {review.author} · {review.platform} · {"★".repeat(review.rating)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <EditDialog title="Sửa review" action={updateReview.bind(null, review.id)}>
                      <ImageUploadField required={false} hint="Để trống nếu không đổi avatar" />
                      <TextArea label="Nội dung review" name="quote" defaultValue={review.quote} required />
                      <TextInput label="Tên khách hàng" name="author" defaultValue={review.author} required />
                      <TextInput
                        label="Nguồn review"
                        name="platform"
                        defaultValue={review.platform}
                        placeholder="Google, Wezoree..."
                      />
                      <SelectInput label="Số sao" name="rating" defaultValue={review.rating}>
                        <RatingOptions />
                      </SelectInput>
                    </EditDialog>
                    <form action={deleteReview.bind(null, review.id)}>
                      <ConfirmSubmitButton
                        message="Xoá review này?"
                        title="Xoá"
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </Card>
              ),
            }))}
            onReorder={reorderReviews}
            layout="list"
            className="flex flex-col gap-3"
          />
        )}

        <Card>
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">
            Thêm review mới
          </h3>
          <ActionForm action={addReview} submitLabel="Thêm review" pendingLabel="Đang tải lên...">
            <ImageUploadField required={false} hint="Không bắt buộc — để trống nếu khách không có ảnh đại diện" />
            <TextArea label="Nội dung review" name="quote" required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextInput label="Tên khách hàng" name="author" required />
              <TextInput label="Nguồn review" name="platform" placeholder="Google, Wezoree..." />
              <SelectInput label="Số sao" name="rating" defaultValue={5}>
                <RatingOptions />
              </SelectInput>
            </div>
          </ActionForm>
        </Card>
      </section>
    </div>
  );
}
