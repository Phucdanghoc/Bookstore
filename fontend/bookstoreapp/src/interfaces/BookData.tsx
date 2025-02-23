interface BookData {
  _id: string ;
  title: string;
  author: string;
  price: number;
  category: string;
  stock: number;
  pages: number;
  images: string[];
  publisher: string;
  publication_date: string;
}



interface CategoriesData {
    _id: string;
    count: number;
}

export type {
    BookData,
    CategoriesData
};
