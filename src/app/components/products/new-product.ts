import { Component, ViewChild } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Product } from "src/app/models/product";
import { CategoryService } from "src/app/services/category.service";
import { ProductService } from "src/app/services/products.service";


@Component({
    selector: 'app-product',
    templateUrl: './new-product.html',
    styleUrls: ['./products.component.scss']
})
export class NewProductsComponent {
    public productForm: FormGroup;
    public product: any = {};
    public editProductFlag: boolean = false;
    public showNewProductForm = false;
    public categories: any = []
    @ViewChild('close') close: any;
    constructor(private productSerivce: ProductService, private categoryService: CategoryService) {
        this.productForm = new FormGroup({
            partNumber: new FormControl(''),
            partName: new FormControl(''),
            saleRate: new FormControl(''),
            category: new FormControl(''),
            quantity: new FormControl(''),
            unit: new FormControl(''),
            storeLocation: new FormControl(''),
            ledgerPageNumber: new FormControl(''),
        })
    }

    ngOnInit() {
        this.getAllCategories();
        this.initializeForm();
    }

    getAllCategories() {
        this.categoryService.getCategorys().subscribe((res: any) => {
            this.categories = res;
            // this.categories.forEach(c => {
            //     this.categroysObj[c._id] = c.categoryName;
            // });
        })
    }

    initializeForm() {
        this.productForm = new FormGroup({
            partNumber: new FormControl(''),
            partName: new FormControl(''),
            saleRate: new FormControl(''),
            category: new FormControl(''),
            quantity: new FormControl(''),
            unit: new FormControl(''),
            storeLocation: new FormControl(''),
            ledgerPageNumber: new FormControl(''),
        })
    }

    saveProduct() {
        if (this.productForm.valid) {
            // save 
            this.productSerivce.saveProduct(this.productForm.value).subscribe(res => {
                this.cancel();
                this.close.nativeElement.click();
                // this.getAllProducts();
            })
        }
    }

    cancel() {
        this.editProductFlag = false
        this.showNewProductForm = false;
        this.initializeForm();
    }
}