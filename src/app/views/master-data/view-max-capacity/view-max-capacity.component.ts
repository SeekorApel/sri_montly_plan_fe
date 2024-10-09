import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Max_Capacity } from 'src/app/models/Max_Capacity';
import { ApiResponse } from 'src/app/response/Response';
import { MaxCapacityService } from 'src/app/services/master-data/max-capacity/max-capacity.service';
import Swal from 'sweetalert2';
declare var $: any;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-view-max-capacity',
  templateUrl: './view-max-capacity.component.html',
  styleUrls: ['./view-max-capacity.component.scss'],
})
export class ViewMaxCapacityComponent implements OnInit {

  //Variable Declaration
  maxCapacitys: Max_Capacity[] = [];
  searchText: string = '';
  errorMessage: string | null = null;
  edtMaxCapacityObject: Max_Capacity = new Max_Capacity();
  isEditMode: boolean = false;
  file: File | null = null;
  editMaxCapacityForm: FormGroup;

  // Pagination
  pageOfItems: Array<any>;
  pageSize: number = 5;
  totalPages: number = 5;

  constructor(private maxCapacityService: MaxCapacityService, private fb: FormBuilder) { 
    this.editMaxCapacityForm = this.fb.group({
      maxCapacity: ['', Validators.required]

    });
  }

  ngOnInit(): void {
    this.getAllMaxCapacity();
  }

  getAllMaxCapacity(): void {
    this.maxCapacityService.getAllMaxCapacity().subscribe(
      (response: ApiResponse<Max_Capacity[]>) => {
        this.maxCapacitys = response.data;
        this.onChangePage(this.maxCapacitys.slice(0, this.pageSize));
      },
      (error) => {
        this.errorMessage = 'Failed to load quadrants: ' + error.message;
      }
    );
  }

  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  onSearchChange(): void {
    // Lakukan filter berdasarkan nama plant yang mengandung text pencarian (case-insensitive)
    const filteredPlants = this.maxCapacitys.filter(
      (maxCapacity) =>
        maxCapacity.max_Cap_ID
          .toString()
          .includes(this.searchText.toLowerCase()) ||
          maxCapacity.product_ID.toString().includes(this.searchText)||
          maxCapacity.machine_curing_type_ID.toLowerCase().toString().includes(this.searchText) ||
          maxCapacity.cycle_TIME.toString().includes(this.searchText) ||
          maxCapacity.capacity_Shift_1.toString().includes(this.searchText) ||
          maxCapacity.capacity_Shift_2.toString().includes(this.searchText) ||
          maxCapacity.capacity_Shift_3.toString().includes(this.searchText)
    );

    // Tampilkan hasil filter pada halaman pertama
    this.onChangePage(filteredPlants.slice(0, this.pageSize));
  }

  resetSearch(): void {
    this.searchText = '';
    this.onChangePage(this.maxCapacitys.slice(0, this.pageSize));
  }

  updateMaxCapacity(): void {
    
    this.maxCapacityService.updateMaxCapacity(this.edtMaxCapacityObject).subscribe(
      (response) => {
        // SweetAlert setelah update berhasil
        Swal.fire({
          title: 'Success!',
          text: 'Data quadrant successfully updated.',
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

  openModalEdit(idMaxCapacity: number): void {
    this.isEditMode = true;
    this.getQuadrantById(idMaxCapacity);
    $('#editModal').modal('show');
  }

  getQuadrantById(idMaxCapacity: number): void {
    this.maxCapacityService.getMaxCapacityById(idMaxCapacity).subscribe(
      (response: ApiResponse<Max_Capacity>) => {
        this.edtMaxCapacityObject = response.data;
      },
      (error) => {
        this.errorMessage = 'Failed to load quadrants: ' + error.message;
      }
    );
  }

  deleteData(maxCapacity: Max_Capacity): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This data Max Capacity will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.maxCapacityService.deleteMaxCapacity(maxCapacity).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'Data quadrant has been deleted', 'success').then(() => {
              window.location.reload();
            });
          },
          (err) => {
            Swal.fire('Error!', 'Failed to delete the quadrant.', 'error');
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
    link.href = 'assets/Template Excel/Layout_Master_Max_Capacity.xlsx';
    link.download = 'Layout_Master_Max_Capacity.xlsx';
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
      this.maxCapacityService.uploadFileExcel(formData).subscribe(
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
  };
}