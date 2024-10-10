import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Size } from 'src/app/models/Size';
import { ApiResponse } from 'src/app/response/Response';
import { SizeService } from 'src/app/services/master-data/size/size.service';
import Swal from 'sweetalert2';
declare var $: any;
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-view-size',
  templateUrl: './view-size.component.html',
  styleUrls: ['./view-size.component.scss']
})
export class ViewSizeComponent implements OnInit {

  //Variable Declaration
  sizes: Size[] = [];
  searchText: string = '';
  errorMessage: string | null = null;
  edtSizeObject: Size = new Size();
  isEditMode: boolean = false;
  file: File | null = null;
  editSizeForm: FormGroup;

  // Pagination
  pageOfItems: Array<any>;
  pageSize: number = 5;
  totalPages: number = 5;

  constructor(private sizeService: SizeService, private fb: FormBuilder) { 
    this.editSizeForm = this.fb.group({
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllSize();
  }

  getAllSize(): void {
    this.sizeService.getAllSize().subscribe(
      (response: ApiResponse<Size[]>) => {
        this.sizes = response.data;
        this.onChangePage(this.sizes.slice(0, this.pageSize));
      },
      (error) => {
        this.errorMessage = 'Failed to load sizes: ' + error.message;
      }
    );
  }

  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  onSearchChange(): void {
    // Lakukan filter berdasarkan nama plant yang mengandung text pencarian (case-insensitive)
    const filteredSizes = this.sizes.filter(
      (size) =>
        size.description
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        size.size_ID.toString().includes(this.searchText)
    );

    // Tampilkan hasil filter pada halaman pertama
    this.onChangePage(filteredSizes.slice(0, this.pageSize));
  }

  resetSearch(): void {
    this.searchText = '';
    this.onChangePage(this.sizes.slice(0, this.pageSize));
  }

  updateSize(): void {
    
    this.sizeService.updateSize(this.edtSizeObject).subscribe(
      (response) => {
        // SweetAlert setelah update berhasil
        Swal.fire({
          title: 'Success!',
          text: 'Data size successfully updated.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            $('#editModal').modal('hide');
            window.location.reload();
          }
        });
      },
      (err) => {
        Swal.fire('Error!', 'Error updating data.', 'error');
      }
    );
  }

  openModalEdit(idSize: string): void {
    this.isEditMode = true;
    this.getSizeById(idSize);
    $('#editModal').modal('show');
  }

  getSizeById(idSize: string): void {
    this.sizeService.getSizeById(idSize).subscribe(
      (response: ApiResponse<Size>) => {
        this.edtSizeObject = response.data;
      },
      (error) => {
        this.errorMessage = 'Failed to load sizes: ' + error.message;
      }
    );
  }

  deleteData(size: Size): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This data size will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sizeService.deleteSize(size).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'Data size has been deleted', 'success').then(() => {
              window.location.reload();
            });
          },
          (err) => {
            Swal.fire('Error!', 'Failed to delete the size.', 'error');
          }
        );
      }
    });
  }

  activateData(size: Size): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This data size will be Activated!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) { 
        this.sizeService.activateSize(size).subscribe(
          (response) => {
            Swal.fire('Activated!', 'Data size has been Activated', 'success').then(() => {
              window.location.reload();
            });
          },
          (err) => {
            Swal.fire('Error!', 'Failed to Activated the size.', 'error');
          }
        );
      }
    });
  }

  openModalUpload(): void {
    $('#uploadModal').modal('show');
  }

  downloadTemplate() {
    const link = document.createElement('a');
    link.href = 'assets/Template Excel/Layout_Size.xlsx';
    link.download = 'Layout_Size.xlsx';
    link.click();
  }


  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();

      // Validasi ekstensi file
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        this.file = file; // Hanya simpan file jika ekstensi valid
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid File Type',
          text: 'Please upload a valid Excel file (.xls or .xlsx).',
          confirmButtonText: 'OK',
        });
        // Kosongkan file jika ekstensi tidak valid
        this.file = null;
        input.value = '';
      }
    }
  }


  uploadFileExcel() {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file);
      // unggah file Excel
      this.sizeService.uploadFileExcel(formData).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Excel file uploaded successfully.',
            confirmButtonText: 'OK',
          }).then(() => {
            $('#editModal').modal('hide');
            window.location.reload();
          });
        },
        (error) => {
          console.error('Error uploading file', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'An error occurred while uploading the file.',
            confirmButtonText: 'OK',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Please select a file to upload.',
        confirmButtonText: 'OK',
      });
    }
  }
  downloadExcel(): void {
    this.sizeService.exportSizesExcel().subscribe({
      next: (response) => {
        // Menggunakan nama file yang sudah ditentukan di backend
        const filename = 'SIZE_DATA.xlsx'; // Nama file bisa dinamis jika diperlukan
        saveAs(response, filename); // Mengunduh file
      },
      error: (err) => {
        console.error('Download error:', err);
      }
    });
  }
}
