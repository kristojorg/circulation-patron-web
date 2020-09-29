import { CollectionData } from "interfaces";
import * as collection from "hooks/useCollection";

export const useCollectionSpy = jest.spyOn(collection, "default");

export const collectionFixture: CollectionData = {
  books: [],
  lanes: [],
  id: "collection-id",
  navigationLinks: [],
  title: "Some collection",
  url: "/collection-url"
};

const defaultCollection: ReturnType<typeof collection.default> = {
  collection: collectionFixture,
  isLoading: false,
  url: "/collection-url"
};

export default function mockCollection(
  data: Partial<typeof defaultCollection> = {}
) {
  const collection = {
    ...defaultCollection,
    ...data
  };
  useCollectionSpy.mockReturnValue(collection);
}
