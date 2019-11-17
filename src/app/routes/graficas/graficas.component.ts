import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SettingsService } from '@core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestManagerService, ApiUrl } from '@core/services/requestmanager.service';

@Component({
    selector: 'app-graficas',
    templateUrl: './graficas.component.html',
})

export class GraficasComponent implements OnInit, AfterViewInit {
    rangoFecha = {
        fechaInicio : new Date('2018-12-12T10:20:30Z'),
        fechaFin : Date()
    };
    loading = false;
    graficaTickets: any;
    graficaFamiliaPlatillos: {
      chart: any;
      pieView: any;
    };
    graficaFormasPago: {
      chart: any;
      pieView: any;
    };
    dataSourceTickets = {
      total: {
        ticketsCount: 0,
        costoTotal: 0
      },
      diario: {
        ticketsCount: 0,
        costoTotal: 0
      },
      semanal: {
        ticketsCount: 0,
        costoTotal: 0
      },
      mensual: {
        ticketsCount: 0,
        costoTotal: 0
      },
      puntos: [],
      puntosFormasPago: []
    };
    dataSourceFamiliaPlatillos = {
      puntos: []
    };
    constructor(private settings: SettingsService, private electron: ElectronService, private request: RequestManagerService) {}

    ngOnInit() { }

    ngAfterViewInit() {
      this.graficaTickets = this.genGraficaTickets();
      this.graficaFamiliaPlatillos = this.genPieChart(this.dataSourceFamiliaPlatillos.puntos, 'chart2', 'Vendido');
      this.graficaFormasPago = this.genPieChart(this.dataSourceTickets.puntosFormasPago, 'chart3', 'Pagos');
      this.settings.notice.subscribe(res => {
        this.graficaTickets.forceFit();
        this.graficaFamiliaPlatillos.chart.forceFit();
        this.graficaFormasPago.chart.forceFit();
      });
      this.electron.ipcRenderer.on('gpx-setDate-response', (_: Electron.IpcRendererEvent, value: any) => {
        this.setContent(value);
      });
      this.electron.ipcRenderer.on('gpx-setDate-response-P', (_: Electron.IpcRendererEvent, value: any) => {
        this.setContentPlatillos(value);
      });
      this.setDate();
    }

    private setContent(value: any) {
      this.loading = false;
      this.dataSourceTickets = value;
      this.graficaTickets.source(this.dataSourceTickets.puntos, {
        date: {
          type: 'time',
          mask: 'MM-DD',
        },
      });
      this.graficaTickets.render();
      this.updatePieChart(value.puntosFormasPagos, this.graficaFormasPago);
    }
    private setContentPlatillos(value: any) {
      this.dataSourceFamiliaPlatillos.puntos = value;
      this.updatePieChart(value, this.graficaFamiliaPlatillos);
    }

    updatePieChart(data: [{type: string, value: number}], chart: {chart: any, pieView: any}) {
      const DataView = DataSet.DataView;
      const userDv = new DataView();
      userDv.source(data).transform({
        type: 'percent',
        field: 'value',
        dimension: 'type',
        as: 'percent',
      });
      chart.pieView.source(userDv, {
        percent: {
          formatter: function formatter(val) {
            return (val * 100).toFixed(2) + '%';
          },
        },
      });
      chart.chart.render();
    }
    genGraficaTickets() {
      const g = new G2.Chart({
        container: 'chart1',
        forceFit: true,
        height: 300,
        padding: [20, 20, 80, 50],
      });
      g.source(this.dataSourceTickets.puntos, {
        fecha: {
          type: 'time',
          mask: 'MM-DD',
        },
      });
      g.tooltip({
        crosshairs: {
          type: 'line',
        },
      });
      g.axis('costoTotal', {
        label: {
          formatter: function formatter(val) {
            return val;
          },
        },
      });
      g
        .line()
        .position('fecha*costoTotal')
        .color('costoTotal');
      g
        .point()
        .position('fecha*costoTotal')
        // .color('date')
        .size(4)
        .shape('circle')
        .style({
          stroke: '#fff',
          lineWidth: 1,
        });
      g.render();
      return g;
    }
    genPieChart(data: {type: string, value: number}[], contenedor: string, title: string) {
      const DataView = DataSet.DataView;
      const chartIn = new G2.Chart({
        container: contenedor.toString(),
        forceFit: true,
        height: 300,
        padding: 50,
      });
      chartIn.legend(false);
      chartIn.tooltip({
        showTitle: false,
      });

      const bgView: any = chartIn.view();
      bgView.coord('theta', {
        innerRadius: 0.9,
      });
      bgView
        .intervalStack()
        .position('percent')
        .color('type', ['rgba(255, 255, 255, 0)'])
        .style({
          stroke: '#444',
          lineWidth: 1,
        })
        .tooltip(false)
        .select(false);

      bgView.guide().text({
        position: ['50%', '50%'],
        content: title,
        style: {
          lineHeight: '240px',
          fontSize: '30',
          fill: '#262626',
          textAlign: 'center',
        },
      });

      const intervalView = chartIn.view();
      intervalView.coord('polar', {
        innerRadius: 0.9,
      });
      intervalView.axis(false);
      const userDv = new DataView();
      userDv.source(data).transform({
        type: 'percent',
        field: 'value',
        dimension: 'type',
        as: 'percent',
      });
      const pieViewIn = chartIn.view();
      pieViewIn.source(userDv, {
        percent: {
          formatter: function formatter(val: any) {
            return (val * 100).toFixed(2) + '%';
          },
        },
      });
      pieViewIn.coord('theta', {
        innerRadius: 0.75,
      });
      pieViewIn
        .intervalStack()
        .position('percent')
        .color('type')
        .label('type', {
          offset: 40,
        })
        .select(false);

      chartIn.render();
      const r = {chart: chartIn, pieView: pieViewIn};
      return r;
    }
    setDate() {
        this.loading = true;
        // this.electron.ipcRenderer.send('gpx-setDate', this.rangoFecha);
        this.requestGraficasDate(this.rangoFecha).subscribe((res) => {
          this.setContent(res.tickets);
          this.setContentPlatillos(res.platillos);
        }, (e: HttpErrorResponse) => {
          alert(e.error.message);
        });
    }
    private requestGraficasDate(rangoFecha): Observable<any> {
      return this.request.makeRequest(ApiUrl.graficas, 'post', rangoFecha);
    }
}
