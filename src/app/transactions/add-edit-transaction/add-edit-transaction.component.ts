import { Component, inject, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  CategoryService,
  Category,
} from '../../settings/categories/category.service';
import { Observable } from 'rxjs';
import { TransactionService } from '../transaction.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { combineLatest, switchMap, startWith, of } from 'rxjs';

@Component({
  selector: 'app-add-edit-transaction',
  templateUrl: './add-edit-transaction.component.html',
  styleUrl: './add-edit-transaction.component.css',
})
export class AddEditTransactionComponent implements OnInit {
  transactionForm!: FormGroup;
  categories$!: Observable<Category[]>;
  title: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { action: string; transaction?: any },
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddEditTransactionComponent>,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) {
    this.title = `${this.data.action} Transaction`;
  }

  ngOnInit() {
    this.transactionForm = this.formBuilder.group({
      type: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: [new Date(), Validators.required],
      categoryId: ['', Validators.required],
      description: [''],
    });

    // Si hay una transacción existente (modo Editar), seteamos los valores excepto 'categoryId'
    if (this.data.transaction) {
      this.transactionForm.patchValue({
        type: this.data.transaction.type,
        amount: this.data.transaction.amount,
        date: new Date(this.data.transaction.date),
        description: this.data.transaction.description,
      });
    }

    // Manejamos el observable 'categories$' como un flujo reactivo, pero verificamos que el 'type' tenga valor
    this.categories$ = this.transactionForm.get('type')!.valueChanges.pipe(
      startWith(this.transactionForm.get('type')!.value), // Inicializamos con el valor actual (que puede ser vacío)
      switchMap((type) => {
        if (!type) {
          // Si el tipo es vacío o null (modo Add Transaction sin selección de tipo), devolvemos un array vacío
          return of([]);
        }
        // Si hay un tipo válido, cargamos las categorías por ese tipo
        return this.categoryService.findByType(type);
      })
    );

    // Nos suscribimos para manejar el categoryId en el modo edición
    this.categories$.subscribe((categories) => {
      if (this.data.transaction) {
        const categoryExists = categories.some(
          (category) => category.id === this.data.transaction.categoryId
        );
        if (categoryExists) {
          this.transactionForm.patchValue({
            categoryId: this.data.transaction.categoryId,
          });
        }
      }
    });

    // Inicializar el valor de 'type' si estamos en modo Editar
    if (this.data.transaction) {
      this.transactionForm
        .get('type')
        ?.setValue(this.data.transaction.type, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const transaction = this.transactionForm.value;

      if (this.data.action === 'Edit') {
        transaction.id = this.data.transaction.id;
        this.transactionService
          .update(transaction.id, transaction)
          .subscribe((updatedTransaction) => {
            this.dialogRef.close(updatedTransaction);
          });
      } else {
        this.transactionService
          .create(transaction)
          .subscribe((newTransaction) => {
            this.dialogRef.close(newTransaction);
          });
      }
    }
  }
}
