import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ToolbarComponent } from 'app/components/toolbar/ui.toolbar.component';
import { TreeViewComponent } from 'app/components/tree_view/ui.tree_view.component';
import { ElectronService } from 'app/providers/electron.service';
import { ArangoService } from 'app/providers/arango.service';
import { HttpModule } from '@angular/http';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      declarations: [
        AppComponent, ToolbarComponent, TreeViewComponent
      ],
      providers: [ElectronService, ArangoService],
      schemas:[NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
