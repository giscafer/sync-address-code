import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { dataToTree } from './dataToTree';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '全国省市县街道4级数据';
  loading = false;
  filesTreeData = [];
  selectedFiles = [];
  constructor(private http: HttpClient) {

  }
  ngOnInit() {
    
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any>('./assets/earea_.json').subscribe(data => {
      const tree = dataToTree(data.RECORDS);
      this.filesTreeData = tree;
      this.loading = false;
    })
  }
}
