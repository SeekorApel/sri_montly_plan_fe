import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiResponse } from 'src/app/response/Response';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
declare var $: any;
import * as XLSX from 'xlsx';
import { Select2OptionData } from 'ng-select2';
import { Options } from 'select2';
import { Curing_Machine } from 'src/app/models/Curing_Machine';
import { PMStopMachine } from 'src/app/models/pm-stop-machine';
import { PMStopMachineService } from 'src/app/services/master-data/PM_Stop_Machine/pm_stop_MACHINE.service';
import { CuringMachineService } from 'src/app/services/master-data/curing-machine/curing-machine.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-view-pm-stop-machine',
  templateUrl: './view-pm-stop-machine.component.html',
  styleUrls: ['./view-pm-stop-machine.component.scss'],
})
export class ViewPmStopMachineComponent implements OnInit {
  //Variable Declaration
  pmStopMachines: PMStopMachine[] = [];
  searchText: string = '';
  errorMessage: string | null = null;
  edtPmStopMachineObject: PMStopMachine = new PMStopMachine();
  AddPmStopMachineObject: PMStopMachine = new PMStopMachine();
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  file: File | null = null;
  edtPmStopMachineFrom: FormGroup;
  AddPmStopMachineForm: FormGroup;
  public uomOptionData: Array<Select2OptionData>;
  public options: Options = {
    width: '100%',
    minimumResultsForSearch: 0,
  };
  minDate: string;
  curingMachines: Curing_Machine[];
  

  // Pagination
  pageOfItems: Array<any>;
  pageSize: number = 5;
  totalPages: number = 5;
  displayedColumns: string[] = ['no', 'stop_MACHINE_ID', 'work_CENTER_TEXT', 'start_DATE', 'start_TIME', 'end_DATE', 'end_TIME', 'status', 'action'];
  dataSource: MatTableDataSource<PMStopMachine>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private pmStopService: PMStopMachineService, private fb: FormBuilder, private curingMachineService: CuringMachineService) {
    this.edtPmStopMachineFrom = this.fb.group(
      {
        work_CENTER_TEXTedit: ['', Validators.required],
        start_DATE: ['',  Validators.required],
        start_TIME: ['', Validators.required],
        end_DATE: ['', Validators.required],
        end_TIME: ['', Validators.required],
      },
      {
        validators: [this.timeValidator, this.dateValidator, this.minStartDate], // Tambahkan validator khusus di sini
      }
    );
    this.AddPmStopMachineForm = this.fb.group(
      {
        work_CENTER_TEXTadd: ['', Validators.required],
        start_DATE: ['', Validators.required],
        start_TIME: ['', Validators.required],
        end_DATE: ['', Validators.required],
        end_TIME: ['', Validators.required],
      },
      {
        validators: [this.timeValidator, this.dateValidator, this.minStartDate], // Tambahkan validator khusus di sini
      }
    );
    this.loadCuringMachine();
    this.subscribeToFormChanges();
  }

  // Method untuk debug atau aksi pada perubahan input
  onDateChange(): void {
    const startDateControl = this.AddPmStopMachineForm.get('start_DATE');
    if (startDateControl?.hasError('invalidMinDate')) {
      console.error('Start date must not be earlier than today.');
    }
  }
  
  private timeValidator(control: AbstractControl): ValidationErrors | null {
    const startTime = control.get('start_TIME')?.value;
    const endTime = control.get('end_TIME')?.value;
    const startDate = control.get('start_DATE')?.value;
    const endDate = control.get('end_DATE')?.value;

    const dateStart = new Date(startDate);
    const dateEnd = new Date(endDate);

    if (dateStart.getTime() === dateEnd.getTime()) {
      if (startTime && endTime && startTime >= endTime) {
        return { invalidTime: true }; // Invalid time range
      }
    }

    return null; // Valid
  }

  ngOnInit(): void {
    
    this.getAllPmStopMachine();
  }

  private loadCuringMachine(): void {
    this.curingMachineService.getAllMachineCuring().subscribe(
      (response: ApiResponse<Curing_Machine[]>) => {
        this.curingMachines = response.data;

        if (!this.uomOptionData) {
          this.uomOptionData = [];
        }
        this.uomOptionData = this.curingMachines.map((element) => ({
          id: element.work_CENTER_TEXT.toString(), // Ensure the ID is a string
          text: element.work_CENTER_TEXT, // Set the text to the name (or other property)
        }));
      },
      (error) => {
        this.errorMessage = 'Failed to load Curing Machine: ' + error.message;
      }
    );
  }
  formatedate(date: Date): string {
    const formattedDate = new Date(date).toLocaleDateString('en-CA');
    return formattedDate;
  }
  subscribeToFormChanges(): void {
    this.edtPmStopMachineFrom.get('start_TIME')?.valueChanges.subscribe(() => {
      this.edtPmStopMachineFrom.get('end_TIME')?.updateValueAndValidity({ onlySelf: true });
    });

    this.edtPmStopMachineFrom.get('start_DATE')?.valueChanges.subscribe(() => {
      this.edtPmStopMachineFrom.get('end_DATE')?.updateValueAndValidity({ onlySelf: true });
    });
  }
  private minStartDate(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('start_DATE')?.value;
    const today = new Date();
    const min = today.toISOString().split('T')[0];

    if(startDate < min){
      return { invalidStartDate: true }
    }
    return null;
  }

  private dateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('start_DATE')?.value;
    const endDate = control.get('end_DATE')?.value;
    

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return { invalidDate: true };
      }
    }
    return null;
  }

  getAllPmStopMachine(): void {
    this.pmStopService.getAllPMStopMachine().subscribe(
      (response: ApiResponse<PMStopMachine[]>) => {
        this.pmStopMachines = response.data.map((Element) => {
          return {
            ...Element,
            formattedStartDate: new Date(Element.start_DATE).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            formattedEndDate: new Date(Element.end_DATE).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
          };
        });
        this.dataSource = new MatTableDataSource(this.pmStopMachines);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        // this.onChangePage(this.machineCuringTypes.slice(0, this.pageSize));
      },
      (error) => {
        this.errorMessage = 'Failed to load PM Stop Machine: ' + error.message;
      }
    );
  }

  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  onSearchChange(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  resetSearch(): void {
    this.searchText = '';
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  updatePMStopMachine(): void {
    this.pmStopService.updatePMStopMachine(this.edtPmStopMachineObject).subscribe(
      (response) => {
        // SweetAlert setelah update berhasil
        Swal.fire({
          title: 'Success!',
          text: 'Data PM Stop Machine successfully updated.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            $('#editModal').modal('hide');
            window.location.reload();
          }
        });
        console.log(this.edtPmStopMachineObject);
      },
      (err) => {
        Swal.fire('Error!', 'Error updating data.', 'error');
      }
    );
  }

  savePmStopMachine(): void {
    this.pmStopService.SavePMStopMachine(this.AddPmStopMachineObject).subscribe(
      (response) => {
        // SweetAlert setelah update berhasil
        Swal.fire({
          title: 'Success!',
          text: 'Data PM Stop Machine successfully Saved.',
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
        Swal.fire('Error!', 'Error Saving data.', 'error');
      }
    );
  }

  openModalEdit(work_CENTER_TEXT: number): void {
    this.isEditMode = true;
    this.getPmStopMachineById(work_CENTER_TEXT);
    $('#editModal').modal('show');

    $('#editModal').on('hidden.bs.modal', () => {
      this.resetEditForm();
    });
  }
  openModaldd(): void {
    this.isAddMode = true;
    $('#AddModal').modal('show');

    $('#AddModal').on('hidden.bs.modal', () => {
      this.resetEditForm();
    });
  }
  resetEditForm(): void {
    this.AddPmStopMachineForm.reset();
    this.edtPmStopMachineFrom.reset(); 
    this.isEditMode = false;
    this.isAddMode = false;
  }

  getPmStopMachineById(work_CENTER_TEXT: number): void {
    this.pmStopService.getPMStopMachineById(work_CENTER_TEXT).subscribe(
      (response: ApiResponse<PMStopMachine>) => {
        this.edtPmStopMachineObject = response.data;

        const formattedStartDate = this.formatedate(this.edtPmStopMachineObject.start_DATE);
        const formattedEndDate = this.formatedate(this.edtPmStopMachineObject.end_DATE);

        // Default nilai waktu ke null jika tidak ada
        const startTime = this.edtPmStopMachineObject.start_TIME || null;
        const endTime = this.edtPmStopMachineObject.end_TIME || null;

        this.edtPmStopMachineFrom.patchValue({
          start_DATE: formattedStartDate,
          end_DATE: formattedEndDate,
          // start_TIME: startTime,
          // end_TIME: endTime,
        });
      },
      (error) => {
        this.errorMessage = 'Failed to load PM Stop Machine: ' + error.message;
      }
    );
  }

  deleteData(pmStopMachine: PMStopMachine): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This data PM Stop Machine will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pmStopService.deletePmStopMachine(pmStopMachine).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'Data pm stop machine has been deleted', 'success').then(() => {
              window.location.reload();
            });
          },
          (err) => {
            Swal.fire('Error!', 'Failed to delete the pm stop machine.', 'error');
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
    link.href = 'assets/Template Excel/Layout_PM_Stop_Machine.xlsx';
    link.download = 'Layout_Master_PM_STOP_MACHINE.xlsx';
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
      this.pmStopService.uploadFileExcel(formData).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Excel file uploaded successfully.',
            confirmButtonText: 'OK',
          }).then(() => {
            $('#editModal').modal('hide');
            window.location.reload();
            this.getAllPmStopMachine(); 
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
    this.pmStopService.exportExcel().subscribe({
      next: (response) => {
        // Menggunakan nama file yang sudah ditentukan di backend
        const filename = 'PMSTOPMACHINE_DATA.xlsx'; // Nama file bisa dinamis jika diperlukan
        saveAs(response, filename); // Mengunduh file
      },
      error: (err) => {
        console.error('Download error:', err);
      },
    });
  }
  activateData(pm: PMStopMachine): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This data Machine Curing Type will be Activated!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pmStopService.activatePMStopMachine(pm).subscribe(
          (response) => {
            Swal.fire('Activated!', 'Data PM Stop Machine has been Activated', 'success').then(() => {
              window.location.reload();
            });
          },
          (err) => {
            Swal.fire('Error!', 'Failed to Activated the PM Stop Machine.', 'error');
          }
        );
      }
    });
  }
}
