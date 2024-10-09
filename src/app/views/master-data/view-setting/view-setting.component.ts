import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Setting } from 'src/app/models/Setting';
import { ApiResponse } from 'src/app/response/Response';
import { SettingService } from 'src/app/services/master-data/setting/setting.service';
import Swal from 'sweetalert2';
declare var $: any;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-view-setting',
  templateUrl: './view-setting.component.html',
  styleUrls: ['./view-setting.component.scss'],
})
export class ViewSettingComponent implements OnInit {

  //Variable Declaration
  settings: Setting[] = [];
  searchText: string = '';
  errorMessage: string | null = null;
  edtSettingObject: Setting = new Setting();
  isEditMode: boolean = false;
  file: File | null = null;
  editSettingForm: FormGroup;

  // Pagination
  pageOfItems: Array<any>;
  pageSize: number = 5;
  totalPages: number = 5;

  constructor(private settingService: SettingService, private fb: FormBuilder) { 
    this.editSettingForm = this.fb.group({
      settingKey: ['', Validators.required],
      settingValue: ['', Validators.required],
      description: ['', Validators.required]

    });
  }

  ngOnInit(): void {
    this.getAllSetting();
  }

  getAllSetting(): void {
    this.settingService.getAllSetting().subscribe(
      (response: ApiResponse<Setting[]>) => {
        this.settings = response.data;
        this.onChangePage(this.settings.slice(0, this.pageSize));
      },
      (error) => {
        this.errorMessage = 'Failed to load plants: ' + error.message;
      }
    );
  }

  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  onSearchChange(): void {
    // Lakukan filter berdasarkan nama plant yang mengandung text pencarian (case-insensitive)
    const filteredPlants = this.settings.filter(
      (setting) =>
        setting.setting_KEY
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        setting.setting_ID.toString().includes(this.searchText)||
        setting.setting_VALUE.toLowerCase().toString().includes(this.searchText) ||
        setting.description.toLowerCase().toString().includes(this.searchText)
    );

    // Tampilkan hasil filter pada halaman pertama
    this.onChangePage(filteredPlants.slice(0, this.pageSize));
  }

  resetSearch(): void {
    this.searchText = '';
    this.onChangePage(this.settings.slice(0, this.pageSize));
  }

  updateSetting(): void {
    
    this.settingService.updateSetting(this.edtSettingObject).subscribe(
      (response) => {
        // SweetAlert setelah update berhasil
        Swal.fire({
          title: 'Success!',
          text: 'Data plant successfully updated.',
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

  openModalEdit(idSetting: number): void {
    this.isEditMode = true;
    this.getPlantById(idSetting);
    $('#editModal').modal('show');
  }

  getPlantById(idPlant: number): void {
    this.settingService.getSettingById(idPlant).subscribe(
      (response: ApiResponse<Setting>) => {
        this.edtSettingObject = response.data;
      },
      (error) => {
        this.errorMessage = 'Failed to load plants: ' + error.message;
      }
    );
  }

  deleteData(plant: Setting): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This data plant will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.settingService.deleteSetting(plant).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'Data plant has been deleted', 'success').then(() => {
              window.location.reload();
            });
          },
          (err) => {
            Swal.fire('Error!', 'Failed to delete the plant.', 'error');
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
    link.href = 'assets/Template Excel/Layout_Master_Setting.xlsx';
    link.download = 'Layout_Master_Setting.xlsx';
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
      this.settingService.uploadFileExcel(formData).subscribe(
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