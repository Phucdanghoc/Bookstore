interface BookData {
  _id: string ;
  title: string;
  author: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  pages: number;
  images: string[];
  discount : number;
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
