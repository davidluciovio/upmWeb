import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Column, TableSimpleCrud } from "../../components/table-simple-crud/table-simple-crud";

@Component({
  selector: 'app-model-manager',
  imports: [TableSimpleCrud],
  templateUrl: './model-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelManager { 

public products = [
    {
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5
    },
    {
      code: 'nvklal433',
      name: 'Black Watch',
      description: 'Product Description',
      image: 'black-watch.jpg',
      price: 72,
      category: 'Accessories',
      quantity: 61,
      inventoryStatus: 'INSTOCK',
      rating: 4
    },
    {
      code: 'zz21cz3c1',
      name: 'Blue Band',
      description: 'Product Description',
      image: 'blue-band.jpg',
      price: 79,
      category: 'Fitness',
      quantity: 2,
      inventoryStatus: 'LOWSTOCK',
      rating: 3
    },
    {
      code: '244wgerg2',
      name: 'Blue Sport Band',
      description: 'Product Description',
      image: 'blue-sport-band.jpg',
      price: 62,
      category: 'Fitness',
      quantity: 5,
      inventoryStatus: 'INSTOCK',
      rating: 4
    },
    {
      code: 'h456wer53',
      name: 'Brown Purse',
      description: 'Product Description',
      image: 'brown-purse.jpg',
      price: 120,
      category: 'Accessories',
      quantity: 0,
      inventoryStatus: 'OUTOFSTOCK',
      rating: 4
    },
    {
      code: 'qwjweggwr',
      name: 'Chakra Bracelet',
      description: 'Product Description',
      image: 'chakra-bracelet.jpg',
      price: 32,
      category: 'Accessories',
      quantity: 5,
      inventoryStatus: 'LOWSTOCK',
      rating: 3
    }
  ]

  cols: Column[] = [
    { field: 'code', header: 'Código' },
    { field: 'name', header: 'Nombre' },
    { field: 'description', header: 'Descripción' },
    { field: 'price', header: 'Precio' },
    { field: 'image', header: 'Imagen' },
    { field: 'category', header: 'Categoría' },
    { field: 'quantity', header: 'Cantidad' },
    { field: 'inventoryStatus', header: 'Estado de Inventario' },
    { field: 'rating', header: 'Rating' }
  ]

}
