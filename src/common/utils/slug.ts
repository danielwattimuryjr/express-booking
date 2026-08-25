import slugify from 'slugify';

export function genSlug(text: string) {
    return slugify(text, {
        lower: true,
    });
}
