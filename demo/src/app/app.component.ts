import { cloneDeep } from 'lodash';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { dataToTree } from './dataToTree';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '全国省市县街道4级数据展示（来自高德）';
  loading = false;
  filesTreeData = [];
  selectedFiles2 = [];
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
  selectionChange($event) {
    console.log($event)
    let node = cloneDeep($event);
    delete node.children;
    delete node.parent;
    this.selectedFiles = node;
  }
}