import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewHeaderMoComponent } from './view-header-mo/view-header-mo.component';
import { AddHeaderMoComponent } from './add-header-mo/add-header-mo.component';

const routes: Routes = [{

  path: '',
  data: {
    title: 'Transaksi'
  },
  children: [
    {
      path: '',
      redirectTo: ''
    },
    {
      path: 'transaksi/view-header-mo',
      component: ViewHeaderMoComponent,
      data: {
        title: 'View Header Monthly Planning'
      }
    },
    {
      path: 'transaksi/add-header-mo',
      component: AddHeaderMoComponent,
      data: {
        title: 'Add Header Monthly Planning'
      }
    }
  ]

}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransaksiRoutingModule { }
