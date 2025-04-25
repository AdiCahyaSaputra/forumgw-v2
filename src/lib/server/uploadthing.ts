import { createUploadthing } from 'uploadthing/server';
import type { FileRouter } from 'uploadthing/server';

const f = createUploadthing();

const auth = (req: Request) => {
	console.log(JSON.stringify(req, null, 2));

	return { id: 1 };
}; // Fake auth function

export const ourFileRouter = {
	imageUploader: f({
		image: {
			maxFileSize: '4MB',
			maxFileCount: 1
		}
	})
		.middleware(async ({ req }) => {
			const user = auth(req);

			console.log('Middleware Request: ', JSON.stringify(req, null, 2));

			if (!user) throw new Error('Unauthorized');

			return { userId: user.id };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Upload complete for userId:', metadata.userId);

			console.log('file url', file.ufsUrl);
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
