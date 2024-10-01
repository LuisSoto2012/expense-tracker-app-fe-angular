import { transition } from '@angular/animations';
import { Component } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, ReplaySubject } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddEditTransactionComponent } from './add-edit-transaction/add-edit-transaction.component';
import { TransactionService } from './transaction.service';

interface TransactionTableData {
  id: string;
  amount: number;
  date: Date;
  type: 'Ingreso' | 'Gasto';
  categoryName: string;
  description: string;
  categoryId: string;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent {
  displayedColumns: string[] = [
    'description',
    'categoryName',
    'amount',
    'date',
    'actions',
  ];

  transactions: TransactionTableData[] = [];

  dataSource = new MatTableDataSource<TransactionTableData>(this.transactions);

  constructor(
    private dialog: MatDialog,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.findAll().subscribe((transactions) => {
      // Map the transactions to the table data
      this.transactions = transactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        categoryName: transaction.categoryName,
        description: transaction.description,
        categoryId: transaction.categoryId,
      }));
      this.dataSource = new MatTableDataSource<TransactionTableData>(
        this.transactions
      );
    });
  }

  addTransaction() {
    const dialogRef = this.dialog.open(AddEditTransactionComponent, {
      data: { action: 'Add' },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle the new transaction data
        console.log('New transaction:', result);
        // You might want to update the table with the new transaction here
        this.updateDataSource(result);
      }
    });
  }

  updateDataSource(newTransaction: any): void {
    const updatedData = [...this.dataSource.data, newTransaction];
    this.dataSource.data = updatedData; // Asignar el nuevo array al dataSource para actualizar la tabla
  }

  editTransaction(transaction: TransactionTableData): void {
    const dialogRef = this.dialog.open(AddEditTransactionComponent, {
      data: { action: 'Edit', transaction },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Result: ', result);
      if (result) {
        // Find the index of the transaction to be updated
        const index = this.transactions.findIndex(
          (t) => t.id === transaction.id
        );
        if (index !== -1) {
          // Update the transaction in the transactions array
          this.transactions[index] = result.transaction;
          // Update the dataSource to reflect the changes in the table
          this.dataSource.data = this.transactions;
        }
      }
    });
  }

  deleteTransaction(category: TransactionTableData): void {
    console.log('deleting...');
  }

  // Definir los colores para cada tipo de transacción
  colorChips: { [key: string]: string } = {
    Ingreso: '#C8E6C9', // Verde claro para ingresos
    Gasto: '#FFA07A', // El rojo un poco más claro para gastos
  };
}
