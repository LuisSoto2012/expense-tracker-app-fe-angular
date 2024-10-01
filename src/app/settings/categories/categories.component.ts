import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { CategoryService } from './category.service';
import { Category } from './category.service';
import { MatTableDataSource } from '@angular/material/table';

interface CategoryTableData {
  name: string;
  type: 'Ingreso' | 'Gasto';
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  categoryForm: FormGroup;
  categories: CategoryTableData[] = [];
  isEditing = false;
  editingCategoryId: string | null = null;
  displayedColumns: string[] = ['name', 'type', 'actions'];

  dataSource = new MatTableDataSource<CategoryTableData>(this.categories);
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  @ViewChild(MatSort) sort: MatSort | undefined;

  ngAfterViewInit() {
    if (this.sort) {
      console.log('sort', this.sort);
      this.dataSource.sort = this.sort;
    }
  }

  loadCategories(): void {
    this.categoryService.findAll().subscribe(
      (categories) => {
        this.categories = categories.map((category) => ({
          name: category.name,
          type: category.type,
        }));
        this.dataSource.data = this.categories;
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      if (this.isEditing && this.editingCategoryId !== null) {
        // Update existing category
        this.categoryService
          .update(this.editingCategoryId, formValue)
          .subscribe(
            (updatedCategory) => {
              const index = this.categories.findIndex(
                (c, i) =>
                  i ===
                  this.categories.findIndex(
                    (cat) => cat.name === updatedCategory.name
                  )
              );
              if (index !== -1) {
                this.categories[index] = {
                  name: updatedCategory.name,
                  type: updatedCategory.type,
                };
                this.dataSource.data = this.categories;
              }
              this.resetForm();
            },
            (error) => {
              console.error('Error updating category:', error);
            }
          );
      } else {
        // Add new category
        console.log('Creating new category:', formValue);
        this.categoryService.create(formValue).subscribe(
          (newCategory) => {
            this.categories.push({
              name: newCategory.name,
              type: newCategory.type,
            });
            this.dataSource.data = this.categories;
            this.resetForm();
          },
          (error) => {
            console.error('Error creating category:', error);
          }
        );
      }
    }
  }

  editCategory(category: CategoryTableData): void {
    this.isEditing = true;
    this.editingCategoryId = this.categories
      .findIndex((c) => c.name === category.name)
      .toString();
    this.categoryForm.patchValue(category);
  }

  deleteCategory(category: CategoryTableData): void {
    const index = this.categories.findIndex((c) => c.name === category.name);
    if (index !== -1) {
      this.categoryService.delete(index.toString()).subscribe(
        () => {
          this.categories = this.categories.filter(
            (c) => c.name !== category.name
          );
          this.dataSource.data = this.categories;
        },
        (error) => {
          console.error('Error deleting category:', error);
        }
      );
    }
  }

  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      console.log(`Sorted ${sortState.direction}ending`);
    } else {
      console.log('Sorting cleared');
    }
  }

  private resetForm(): void {
    this.categoryForm.reset();
    this.isEditing = false;
    this.editingCategoryId = null;
  }
}
