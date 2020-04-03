var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Component, ElementRef, AfterContentInit, AfterViewChecked, Input, Output, ContentChildren, QueryList, TemplateRef, EventEmitter, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule, PrimeTemplate } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { ObjectUtils } from 'primeng/utils';
import { FilterUtils } from 'primeng/utils';
let PickList = class PickList {
    constructor(el) {
        this.el = el;
        this.trackBy = (index, item) => item;
        this.showSourceFilter = true;
        this.showTargetFilter = true;
        this.metaKeySelection = true;
        this.showSourceControls = true;
        this.showTargetControls = true;
        this.disabled = false;
        this.filterMatchMode = "contains";
        this.onMoveToSource = new EventEmitter();
        this.onMoveAllToSource = new EventEmitter();
        this.onMoveAllToTarget = new EventEmitter();
        this.onMoveToTarget = new EventEmitter();
        this.onSourceReorder = new EventEmitter();
        this.onTargetReorder = new EventEmitter();
        this.onSourceSelect = new EventEmitter();
        this.onTargetSelect = new EventEmitter();
        this.onSourceFilter = new EventEmitter();
        this.onTargetFilter = new EventEmitter();
        this.selectedItemsSource = [];
        this.selectedItemsTarget = [];
        this.SOURCE_LIST = -1;
        this.TARGET_LIST = 1;
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;
                case 'emptymessagesource':
                    this.emptyMessageSourceTemplate = item.template;
                    break;
                case 'emptymessagetarget':
                    this.emptyMessageTargetTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    ngAfterViewChecked() {
        if (this.movedUp || this.movedDown) {
            let listItems = DomHandler.find(this.reorderedListElement, 'li.ui-state-highlight');
            let listItem;
            if (this.movedUp)
                listItem = listItems[0];
            else
                listItem = listItems[listItems.length - 1];
            DomHandler.scrollInView(this.reorderedListElement, listItem);
            this.movedUp = false;
            this.movedDown = false;
            this.reorderedListElement = null;
        }
    }
    onItemClick(event, item, selectedItems, callback) {
        if (this.disabled) {
            return;
        }
        let index = this.findIndexInSelection(item, selectedItems);
        let selected = (index != -1);
        let metaSelection = this.itemTouched ? false : this.metaKeySelection;
        if (metaSelection) {
            let metaKey = (event.metaKey || event.ctrlKey || event.shiftKey);
            if (selected && metaKey) {
                selectedItems.splice(index, 1);
            }
            else {
                if (!metaKey) {
                    selectedItems.length = 0;
                }
                selectedItems.push(item);
            }
        }
        else {
            if (selected)
                selectedItems.splice(index, 1);
            else
                selectedItems.push(item);
        }
        callback.emit({ originalEvent: event, items: selectedItems });
        this.itemTouched = false;
    }
    onSourceItemDblClick() {
        if (this.disabled) {
            return;
        }
        this.moveRight();
    }
    onTargetItemDblClick() {
        if (this.disabled) {
            return;
        }
        this.moveLeft();
    }
    onFilter(event, data, listType) {
        let query = event.target.value.trim().toLowerCase();
        let searchFields = this.filterBy.split(',');
        if (listType === this.SOURCE_LIST) {
            this.filterValueSource = query;
            this.visibleOptionsSource = FilterUtils.filter(data, searchFields, this.filterValueSource, this.filterMatchMode);
            this.onSourceFilter.emit({ query: this.filterValueSource, value: this.visibleOptionsSource });
        }
        else if (listType === this.TARGET_LIST) {
            this.filterValueTarget = query;
            this.visibleOptionsTarget = FilterUtils.filter(data, searchFields, this.filterValueTarget, this.filterMatchMode);
            this.onTargetFilter.emit({ query: this.filterValueTarget, value: this.visibleOptionsTarget });
        }
    }
    isItemVisible(item, listType) {
        if (listType == this.SOURCE_LIST)
            return this.isVisibleInList(this.visibleOptionsSource, item, this.filterValueSource);
        else
            return this.isVisibleInList(this.visibleOptionsTarget, item, this.filterValueTarget);
    }
    isVisibleInList(data, item, filterValue) {
        if (filterValue && filterValue.trim().length) {
            for (let i = 0; i < data.length; i++) {
                if (item == data[i]) {
                    return true;
                }
            }
        }
        else {
            return true;
        }
    }
    onItemTouchEnd(event) {
        if (this.disabled) {
            return;
        }
        this.itemTouched = true;
    }
    sortByIndexInList(items, list) {
        return items.sort((item1, item2) => this.findIndexInList(item1, list) - this.findIndexInList(item2, list));
    }
    moveUp(listElement, list, selectedItems, callback) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = 0; i < selectedItems.length; i++) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = this.findIndexInList(selectedItem, list);
                if (selectedItemIndex != 0) {
                    let movedItem = list[selectedItemIndex];
                    let temp = list[selectedItemIndex - 1];
                    list[selectedItemIndex - 1] = movedItem;
                    list[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }
            this.movedUp = true;
            this.reorderedListElement = listElement;
            callback.emit({ items: selectedItems });
        }
    }
    moveTop(listElement, list, selectedItems, callback) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = 0; i < selectedItems.length; i++) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = this.findIndexInList(selectedItem, list);
                if (selectedItemIndex != 0) {
                    let movedItem = list.splice(selectedItemIndex, 1)[0];
                    list.unshift(movedItem);
                }
                else {
                    break;
                }
            }
            listElement.scrollTop = 0;
            callback.emit({ items: selectedItems });
        }
    }
    moveDown(listElement, list, selectedItems, callback) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = selectedItems.length - 1; i >= 0; i--) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = this.findIndexInList(selectedItem, list);
                if (selectedItemIndex != (list.length - 1)) {
                    let movedItem = list[selectedItemIndex];
                    let temp = list[selectedItemIndex + 1];
                    list[selectedItemIndex + 1] = movedItem;
                    list[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }
            this.movedDown = true;
            this.reorderedListElement = listElement;
            callback.emit({ items: selectedItems });
        }
    }
    moveBottom(listElement, list, selectedItems, callback) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = selectedItems.length - 1; i >= 0; i--) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = this.findIndexInList(selectedItem, list);
                if (selectedItemIndex != (list.length - 1)) {
                    let movedItem = list.splice(selectedItemIndex, 1)[0];
                    list.push(movedItem);
                }
                else {
                    break;
                }
            }
            listElement.scrollTop = listElement.scrollHeight;
            callback.emit({ items: selectedItems });
        }
    }
    moveRight() {
        if (this.selectedItemsSource && this.selectedItemsSource.length) {
            for (let i = 0; i < this.selectedItemsSource.length; i++) {
                let selectedItem = this.selectedItemsSource[i];
                if (this.findIndexInList(selectedItem, this.target) == -1) {
                    this.target.push(this.source.splice(this.findIndexInList(selectedItem, this.source), 1)[0]);
                }
            }
            this.onMoveToTarget.emit({
                items: this.selectedItemsSource
            });
            this.selectedItemsSource = [];
        }
    }
    moveAllRight() {
        if (this.source) {
            let movedItems = [];
            for (let i = 0; i < this.source.length; i++) {
                if (this.isItemVisible(this.source[i], this.SOURCE_LIST)) {
                    let removedItem = this.source.splice(i, 1)[0];
                    this.target.push(removedItem);
                    movedItems.push(removedItem);
                    i--;
                }
            }
            this.onMoveToTarget.emit({
                items: movedItems
            });
            this.onMoveAllToTarget.emit({
                items: movedItems
            });
            this.selectedItemsSource = [];
        }
    }
    moveLeft() {
        if (this.selectedItemsTarget && this.selectedItemsTarget.length) {
            for (let i = 0; i < this.selectedItemsTarget.length; i++) {
                let selectedItem = this.selectedItemsTarget[i];
                if (this.findIndexInList(selectedItem, this.source) == -1) {
                    this.source.push(this.target.splice(this.findIndexInList(selectedItem, this.target), 1)[0]);
                }
            }
            this.onMoveToSource.emit({
                items: this.selectedItemsTarget
            });
            this.selectedItemsTarget = [];
        }
    }
    moveAllLeft() {
        if (this.target) {
            let movedItems = [];
            for (let i = 0; i < this.target.length; i++) {
                if (this.isItemVisible(this.target[i], this.TARGET_LIST)) {
                    let removedItem = this.target.splice(i, 1)[0];
                    this.source.push(removedItem);
                    movedItems.push(removedItem);
                    i--;
                }
            }
            this.onMoveToSource.emit({
                items: movedItems
            });
            this.onMoveAllToSource.emit({
                items: movedItems
            });
            this.selectedItemsTarget = [];
        }
    }
    isSelected(item, selectedItems) {
        return this.findIndexInSelection(item, selectedItems) != -1;
    }
    findIndexInSelection(item, selectedItems) {
        return this.findIndexInList(item, selectedItems);
    }
    findIndexInList(item, list) {
        let index = -1;
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i] == item) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
    onDragStart(event, index, listType) {
        event.dataTransfer.setData('text', 'b'); // For firefox
        event.target.blur();
        this.dragging = true;
        this.fromListType = listType;
        if (listType === this.SOURCE_LIST)
            this.draggedItemIndexSource = index;
        else
            this.draggedItemIndexTarget = index;
    }
    onDragOver(event, index, listType) {
        if (this.dragging) {
            if (listType == this.SOURCE_LIST) {
                if (this.draggedItemIndexSource !== index && this.draggedItemIndexSource + 1 !== index || (this.fromListType === this.TARGET_LIST)) {
                    this.dragOverItemIndexSource = index;
                    event.preventDefault();
                }
            }
            else {
                if (this.draggedItemIndexTarget !== index && this.draggedItemIndexTarget + 1 !== index || (this.fromListType === this.SOURCE_LIST)) {
                    this.dragOverItemIndexTarget = index;
                    event.preventDefault();
                }
            }
            this.onListItemDroppoint = true;
        }
    }
    onDragLeave(event, listType) {
        this.dragOverItemIndexSource = null;
        this.dragOverItemIndexTarget = null;
        this.onListItemDroppoint = false;
    }
    onDrop(event, index, listType) {
        if (this.onListItemDroppoint) {
            if (listType === this.SOURCE_LIST) {
                if (this.fromListType === this.TARGET_LIST) {
                    this.insert(this.draggedItemIndexTarget, this.target, index, this.source, this.onMoveToSource);
                }
                else {
                    ObjectUtils.reorderArray(this.source, this.draggedItemIndexSource, (this.draggedItemIndexSource > index) ? index : (index === 0) ? 0 : index - 1);
                    this.onSourceReorder.emit({ items: this.source[this.draggedItemIndexSource] });
                }
                this.dragOverItemIndexSource = null;
            }
            else {
                if (this.fromListType === this.SOURCE_LIST) {
                    this.insert(this.draggedItemIndexSource, this.source, index, this.target, this.onMoveToTarget);
                }
                else {
                    ObjectUtils.reorderArray(this.target, this.draggedItemIndexTarget, (this.draggedItemIndexTarget > index) ? index : (index === 0) ? 0 : index - 1);
                    this.onTargetReorder.emit({ items: this.target[this.draggedItemIndexTarget] });
                }
                this.dragOverItemIndexTarget = null;
            }
            this.listHighlightTarget = false;
            this.listHighlightSource = false;
            event.preventDefault();
        }
    }
    onDragEnd(event) {
        this.dragging = false;
    }
    onListDrop(event, listType) {
        if (!this.onListItemDroppoint) {
            if (listType === this.SOURCE_LIST) {
                if (this.fromListType === this.TARGET_LIST) {
                    this.insert(this.draggedItemIndexTarget, this.target, null, this.source, this.onMoveToSource);
                }
            }
            else {
                if (this.fromListType === this.SOURCE_LIST) {
                    this.insert(this.draggedItemIndexSource, this.source, null, this.target, this.onMoveToTarget);
                }
            }
            this.listHighlightTarget = false;
            this.listHighlightSource = false;
            event.preventDefault();
        }
    }
    insert(fromIndex, fromList, toIndex, toList, callback) {
        const elementtomove = fromList[fromIndex];
        if (toIndex === null)
            toList.push(fromList.splice(fromIndex, 1)[0]);
        else
            toList.splice(toIndex, 0, fromList.splice(fromIndex, 1)[0]);
        callback.emit({
            items: [elementtomove]
        });
    }
    onListMouseMove(event, listType) {
        if (this.dragging) {
            let moveListType = (listType == 0 ? this.listViewSourceChild : this.listViewTargetChild);
            let offsetY = moveListType.nativeElement.getBoundingClientRect().top + document.body.scrollTop;
            let bottomDiff = (offsetY + moveListType.nativeElement.clientHeight) - event.pageY;
            let topDiff = (event.pageY - offsetY);
            if (bottomDiff < 25 && bottomDiff > 0)
                moveListType.nativeElement.scrollTop += 15;
            else if (topDiff < 25 && topDiff > 0)
                moveListType.nativeElement.scrollTop -= 15;
            if (listType === this.SOURCE_LIST) {
                if (this.fromListType === this.TARGET_LIST)
                    this.listHighlightSource = true;
            }
            else {
                if (this.fromListType === this.SOURCE_LIST)
                    this.listHighlightTarget = true;
            }
            event.preventDefault();
        }
    }
    onListDragLeave() {
        this.listHighlightTarget = false;
        this.listHighlightSource = false;
    }
    resetFilter() {
        this.visibleOptionsSource = null;
        this.filterValueSource = null;
        this.visibleOptionsTarget = null;
        this.filterValueTarget = null;
        this.sourceFilterViewChild.nativeElement.value = '';
        this.targetFilterViewChild.nativeElement.value = '';
    }
    onItemKeydown(event, item, selectedItems, callback) {
        let listItem = event.currentTarget;
        switch (event.which) {
            //down
            case 40:
                var nextItem = this.findNextItem(listItem);
                if (nextItem) {
                    nextItem.focus();
                }
                event.preventDefault();
                break;
            //up
            case 38:
                var prevItem = this.findPrevItem(listItem);
                if (prevItem) {
                    prevItem.focus();
                }
                event.preventDefault();
                break;
            //enter
            case 13:
                this.onItemClick(event, item, selectedItems, callback);
                event.preventDefault();
                break;
        }
    }
    findNextItem(item) {
        let nextItem = item.nextElementSibling;
        if (nextItem)
            return !DomHandler.hasClass(nextItem, 'ui-picklist-item') || DomHandler.isHidden(nextItem) ? this.findNextItem(nextItem) : nextItem;
        else
            return null;
    }
    findPrevItem(item) {
        let prevItem = item.previousElementSibling;
        if (prevItem)
            return !DomHandler.hasClass(prevItem, 'ui-picklist-item') || DomHandler.isHidden(prevItem) ? this.findPrevItem(prevItem) : prevItem;
        else
            return null;
    }
};
PickList.ctorParameters = () => [
    { type: ElementRef }
];
__decorate([
    Input()
], PickList.prototype, "source", void 0);
__decorate([
    Input()
], PickList.prototype, "target", void 0);
__decorate([
    Input()
], PickList.prototype, "sourceHeader", void 0);
__decorate([
    Input()
], PickList.prototype, "targetHeader", void 0);
__decorate([
    Input()
], PickList.prototype, "responsive", void 0);
__decorate([
    Input()
], PickList.prototype, "filterBy", void 0);
__decorate([
    Input()
], PickList.prototype, "trackBy", void 0);
__decorate([
    Input()
], PickList.prototype, "sourceTrackBy", void 0);
__decorate([
    Input()
], PickList.prototype, "targetTrackBy", void 0);
__decorate([
    Input()
], PickList.prototype, "showSourceFilter", void 0);
__decorate([
    Input()
], PickList.prototype, "showTargetFilter", void 0);
__decorate([
    Input()
], PickList.prototype, "metaKeySelection", void 0);
__decorate([
    Input()
], PickList.prototype, "dragdrop", void 0);
__decorate([
    Input()
], PickList.prototype, "style", void 0);
__decorate([
    Input()
], PickList.prototype, "styleClass", void 0);
__decorate([
    Input()
], PickList.prototype, "sourceStyle", void 0);
__decorate([
    Input()
], PickList.prototype, "targetStyle", void 0);
__decorate([
    Input()
], PickList.prototype, "showSourceControls", void 0);
__decorate([
    Input()
], PickList.prototype, "showTargetControls", void 0);
__decorate([
    Input()
], PickList.prototype, "sourceFilterPlaceholder", void 0);
__decorate([
    Input()
], PickList.prototype, "targetFilterPlaceholder", void 0);
__decorate([
    Input()
], PickList.prototype, "disabled", void 0);
__decorate([
    Input()
], PickList.prototype, "ariaSourceFilterLabel", void 0);
__decorate([
    Input()
], PickList.prototype, "ariaTargetFilterLabel", void 0);
__decorate([
    Input()
], PickList.prototype, "filterMatchMode", void 0);
__decorate([
    Output()
], PickList.prototype, "onMoveToSource", void 0);
__decorate([
    Output()
], PickList.prototype, "onMoveAllToSource", void 0);
__decorate([
    Output()
], PickList.prototype, "onMoveAllToTarget", void 0);
__decorate([
    Output()
], PickList.prototype, "onMoveToTarget", void 0);
__decorate([
    Output()
], PickList.prototype, "onSourceReorder", void 0);
__decorate([
    Output()
], PickList.prototype, "onTargetReorder", void 0);
__decorate([
    Output()
], PickList.prototype, "onSourceSelect", void 0);
__decorate([
    Output()
], PickList.prototype, "onTargetSelect", void 0);
__decorate([
    Output()
], PickList.prototype, "onSourceFilter", void 0);
__decorate([
    Output()
], PickList.prototype, "onTargetFilter", void 0);
__decorate([
    ViewChild('sourcelist')
], PickList.prototype, "listViewSourceChild", void 0);
__decorate([
    ViewChild('targetlist')
], PickList.prototype, "listViewTargetChild", void 0);
__decorate([
    ViewChild('sourceFilter')
], PickList.prototype, "sourceFilterViewChild", void 0);
__decorate([
    ViewChild('targetFilter')
], PickList.prototype, "targetFilterViewChild", void 0);
__decorate([
    ContentChildren(PrimeTemplate)
], PickList.prototype, "templates", void 0);
PickList = __decorate([
    Component({
        selector: 'p-pickList',
        template: `
        <div [class]="styleClass" [ngStyle]="style" [ngClass]="{'ui-picklist ui-widget ui-helper-clearfix': true,'ui-picklist-responsive': responsive}">
            <div class="ui-picklist-source-controls ui-picklist-buttons" *ngIf="showSourceControls">
                <div class="ui-picklist-buttons-cell">
                    <button type="button" pButton icon="pi pi-angle-up" [disabled]="disabled" (click)="moveUp(sourcelist,source,selectedItemsSource,onSourceReorder)"></button>
                    <button type="button" pButton icon="pi pi-angle-double-up" [disabled]="disabled" (click)="moveTop(sourcelist,source,selectedItemsSource,onSourceReorder)"></button>
                    <button type="button" pButton icon="pi pi-angle-down" [disabled]="disabled" (click)="moveDown(sourcelist,source,selectedItemsSource,onSourceReorder)"></button>
                    <button type="button" pButton icon="pi pi-angle-double-down" [disabled]="disabled" (click)="moveBottom(sourcelist,source,selectedItemsSource,onSourceReorder)"></button>
                </div>
            </div>
            <div class="ui-picklist-listwrapper ui-picklist-source-wrapper" [ngClass]="{'ui-picklist-listwrapper-nocontrols':!showSourceControls}">
                <div class="ui-picklist-caption ui-widget-header ui-corner-tl ui-corner-tr" *ngIf="sourceHeader">{{sourceHeader}}</div>
                <div class="ui-picklist-filter-container ui-widget-content" *ngIf="filterBy && showSourceFilter !== false">
                    <input #sourceFilter type="text" role="textbox" (keyup)="onFilter($event,source,SOURCE_LIST)" class="ui-picklist-filter ui-inputtext ui-widget ui-state-default ui-corner-all" [disabled]="disabled" [attr.placeholder]="sourceFilterPlaceholder" [attr.aria-label]="ariaSourceFilterLabel">
                    <span class="ui-picklist-filter-icon pi pi-search"></span>
                </div>
                <ul #sourcelist class="ui-widget-content ui-picklist-list ui-picklist-source ui-corner-bottom" [ngClass]="{'ui-picklist-highlight': listHighlightSource}" 
                    [ngStyle]="sourceStyle" (dragover)="onListMouseMove($event,SOURCE_LIST)" (dragleave)="onListDragLeave()" (drop)="onListDrop($event, SOURCE_LIST)" role="listbox" aria-multiselectable="multiple">
                    <ng-template ngFor let-item [ngForOf]="source" [ngForTrackBy]="sourceTrackBy || trackBy" let-i="index" let-l="last">
                        <li class="ui-picklist-droppoint" *ngIf="dragdrop" (dragover)="onDragOver($event, i, SOURCE_LIST)" (drop)="onDrop($event, i, SOURCE_LIST)" (dragleave)="onDragLeave($event, SOURCE_LIST)"
                        [ngClass]="{'ui-picklist-droppoint-highlight': (i === dragOverItemIndexSource)}" [style.display]="isItemVisible(item, SOURCE_LIST) ? 'block' : 'none'"></li>
                        <li [ngClass]="{'ui-picklist-item':true,'ui-state-highlight':isSelected(item,selectedItemsSource), 'ui-state-disabled': disabled}"
                            (click)="onItemClick($event,item,selectedItemsSource,onSourceSelect)" (dblclick)="onSourceItemDblClick()" (touchend)="onItemTouchEnd($event)" (keydown)="onItemKeydown($event,item,selectedItemsSource,onSourceSelect)"
                            [style.display]="isItemVisible(item, SOURCE_LIST) ? 'block' : 'none'" tabindex="0" role="option" [attr.aria-selected]="isSelected(item, selectedItemsSource)"
                            [draggable]="dragdrop" (dragstart)="onDragStart($event, i, SOURCE_LIST)" (dragend)="onDragEnd($event)">
                            <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}"></ng-container>
                        </li>
                        <li class="ui-picklist-droppoint" *ngIf="dragdrop&&l" (dragover)="onDragOver($event, i + 1, SOURCE_LIST)" (drop)="onDrop($event, i + 1, SOURCE_LIST)" (dragleave)="onDragLeave($event, SOURCE_LIST)"
                        [ngClass]="{'ui-picklist-droppoint-highlight': (i + 1 === dragOverItemIndexSource)}"></li>
                    </ng-template>
                    <ng-container *ngIf="(source == null || source.length === 0) && emptyMessageSourceTemplate">
                        <li class="ui-picklist-empty-message">
                            <ng-container *ngTemplateOutlet="emptyMessageSourceTemplate"></ng-container>
                        </li>
                    </ng-container>
                </ul>
            </div>
            <div class="ui-picklist-buttons">
                <div class="ui-picklist-buttons-cell">
                    <button type="button" pButton icon="pi pi-angle-right" [disabled]="disabled" (click)="moveRight()"></button>
                    <button type="button" pButton icon="pi pi-angle-double-right" [disabled]="disabled" (click)="moveAllRight()"></button>
                    <button type="button" pButton icon="pi pi-angle-left" [disabled]="disabled" (click)="moveLeft()"></button>
                    <button type="button" pButton icon="pi pi-angle-double-left" [disabled]="disabled" (click)="moveAllLeft()"></button>
                </div>
            </div>
            <div class="ui-picklist-listwrapper ui-picklist-target-wrapper" [ngClass]="{'ui-picklist-listwrapper-nocontrols':!showTargetControls}">
                <div class="ui-picklist-caption ui-widget-header ui-corner-tl ui-corner-tr" *ngIf="targetHeader">{{targetHeader}}</div>
                <div class="ui-picklist-filter-container ui-widget-content" *ngIf="filterBy && showTargetFilter !== false">
                    <input #targetFilter type="text" role="textbox" (keyup)="onFilter($event,target,TARGET_LIST)" class="ui-picklist-filter ui-inputtext ui-widget ui-state-default ui-corner-all" [disabled]="disabled" [attr.placeholder]="targetFilterPlaceholder" [attr.aria-label]="ariaTargetFilterLabel">
                    <span class="ui-picklist-filter-icon pi pi-search"></span>
                </div>
                <ul #targetlist class="ui-widget-content ui-picklist-list ui-picklist-target ui-corner-bottom" [ngClass]="{'ui-picklist-highlight': listHighlightTarget}" 
                    [ngStyle]="targetStyle" (dragover)="onListMouseMove($event,TARGET_LIST)" (dragleave)="onListDragLeave()" (drop)="onListDrop($event,TARGET_LIST)" role="listbox" aria-multiselectable="multiple">
                    <ng-template ngFor let-item [ngForOf]="target" [ngForTrackBy]="targetTrackBy || trackBy" let-i="index" let-l="last">
                        <li class="ui-picklist-droppoint" *ngIf="dragdrop" (dragover)="onDragOver($event, i, TARGET_LIST)" (drop)="onDrop($event, i, TARGET_LIST)" (dragleave)="onDragLeave($event, TARGET_LIST)"
                        [ngClass]="{'ui-picklist-droppoint-highlight': (i === dragOverItemIndexTarget)}" [style.display]="isItemVisible(item, TARGET_LIST) ? 'block' : 'none'"></li>
                        <li [ngClass]="{'ui-picklist-item':true,'ui-state-highlight':isSelected(item,selectedItemsTarget), 'ui-state-disabled': disabled}"
                            (click)="onItemClick($event,item,selectedItemsTarget,onTargetSelect)" (dblclick)="onTargetItemDblClick()" (touchend)="onItemTouchEnd($event)" (keydown)="onItemKeydown($event,item,selectedItemsTarget,onTargetSelect)"
                            [style.display]="isItemVisible(item, TARGET_LIST) ? 'block' : 'none'" tabindex="0" role="option" [attr.aria-selected]="isSelected(item, selectedItemsTarget)"
                            [draggable]="dragdrop" (dragstart)="onDragStart($event, i, TARGET_LIST)" (dragend)="onDragEnd($event)">
                            <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}"></ng-container>
                        </li>
                        <li class="ui-picklist-droppoint" *ngIf="dragdrop&&l" (dragover)="onDragOver($event, i + 1, TARGET_LIST)" (drop)="onDrop($event, i + 1, TARGET_LIST)" (dragleave)="onDragLeave($event, TARGET_LIST)"
                        [ngClass]="{'ui-picklist-droppoint-highlight': (i + 1 === dragOverItemIndexTarget)}"></li>
                    </ng-template>
                    <ng-container *ngIf="(target == null || target.length === 0) && emptyMessageTargetTemplate">
                        <li class="ui-picklist-empty-message">
                            <ng-container *ngTemplateOutlet="emptyMessageTargetTemplate"></ng-container>
                        </li>
                    </ng-container>
                </ul>
            </div>
            <div class="ui-picklist-target-controls ui-picklist-buttons" *ngIf="showTargetControls">
                <div class="ui-picklist-buttons-cell">
                    <button type="button" pButton icon="pi pi-angle-up" [disabled]="disabled" (click)="moveUp(targetlist,target,selectedItemsTarget,onTargetReorder)"></button>
                    <button type="button" pButton icon="pi pi-angle-double-up" [disabled]="disabled" (click)="moveTop(targetlist,target,selectedItemsTarget,onTargetReorder)"></button>
                    <button type="button" pButton icon="pi pi-angle-down" [disabled]="disabled" (click)="moveDown(targetlist,target,selectedItemsTarget,onTargetReorder)"></button>
                    <button type="button" pButton icon="pi pi-angle-double-down" [disabled]="disabled" (click)="moveBottom(targetlist,target,selectedItemsTarget,onTargetReorder)"></button>
                </div>
            </div>
        </div>
    `,
        changeDetection: ChangeDetectionStrategy.Default
    })
], PickList);
export { PickList };
let PickListModule = class PickListModule {
};
PickListModule = __decorate([
    NgModule({
        imports: [CommonModule, ButtonModule, SharedModule],
        exports: [PickList, SharedModule],
        declarations: [PickList]
    })
], PickListModule);
export { PickListModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlja2xpc3QuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9wcmltZW5nL3BpY2tsaXN0LyIsInNvdXJjZXMiOlsicGlja2xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3TSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxZQUFZLEVBQUMsYUFBYSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBd0Y1QyxJQUFhLFFBQVEsR0FBckIsTUFBYSxRQUFRO0lBb0lqQixZQUFtQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQXRIeEIsWUFBTyxHQUFhLENBQUMsS0FBYSxFQUFFLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO1FBTXZELHFCQUFnQixHQUFZLElBQUksQ0FBQztRQUVqQyxxQkFBZ0IsR0FBWSxJQUFJLENBQUM7UUFFakMscUJBQWdCLEdBQVksSUFBSSxDQUFDO1FBWWpDLHVCQUFrQixHQUFZLElBQUksQ0FBQztRQUVuQyx1QkFBa0IsR0FBWSxJQUFJLENBQUM7UUFNbkMsYUFBUSxHQUFZLEtBQUssQ0FBQztRQU0xQixvQkFBZSxHQUFXLFVBQVUsQ0FBQztRQUVwQyxtQkFBYyxHQUFz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cnQgeyBOZ01vZHVsZSwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdDaGVja2VkLCBJbnB1dCwgT3V0cHV0LCBDb250ZW50Q2hpbGRyZW4sIFF1ZXJ5TGlzdCwgVGVtcGxhdGVSZWYsIEV2ZW50RW1pdHRlciwgVmlld0NoaWxkLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7QnV0dG9uTW9kdWxlfSBmcm9tICdwcmltZW5nL2J1dHRvbic7XG5pbXBvcnQge1NoYXJlZE1vZHVsZSxQcmltZVRlbXBsYXRlfSBmcm9tICdwcmltZW5nL2FwaSc7XG5pbXBvcnQge0RvbUhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvZG9tJztcbmltcG9ydCB7T2JqZWN0VXRpbHN9IGZyb20gJ3ByaW1lbmcvdXRpbHMnO1xuaW1wb3J0IHsgRmlsdGVyVXRpbHMgfSBmcm9tICdwcmltZW5nL3V0aWxzJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdwLXBpY2tMaXN0JyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGl2IFtjbGFzc109XCJzdHlsZUNsYXNzXCIgW25nU3R5bGVdPVwic3R5bGVcIiBbbmdDbGFzc109XCJ7J3VpLXBpY2tsaXN0IHVpLXdpZGdldCB1aS1oZWxwZXItY2xlYXJmaXgnOiB0cnVlLCd1aS1waWNrbGlzdC1yZXNwb25zaXZlJzogcmVzcG9uc2l2ZX1cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1waWNrbGlzdC1zb3VyY2UtY29udHJvbHMgdWktcGlja2xpc3QtYnV0dG9uc1wiICpuZ0lmPVwic2hvd1NvdXJjZUNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXBpY2tsaXN0LWJ1dHRvbnMtY2VsbFwiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS11cFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlVXAoc291cmNlbGlzdCxzb3VyY2Usc2VsZWN0ZWRJdGVtc1NvdXJjZSxvblNvdXJjZVJlb3JkZXIpXCI+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHBCdXR0b24gaWNvbj1cInBpIHBpLWFuZ2xlLWRvdWJsZS11cFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlVG9wKHNvdXJjZWxpc3Qsc291cmNlLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VSZW9yZGVyKVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS1kb3duXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVEb3duKHNvdXJjZWxpc3Qsc291cmNlLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VSZW9yZGVyKVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS1kb3VibGUtZG93blwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlQm90dG9tKHNvdXJjZWxpc3Qsc291cmNlLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VSZW9yZGVyKVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidWktcGlja2xpc3QtbGlzdHdyYXBwZXIgdWktcGlja2xpc3Qtc291cmNlLXdyYXBwZXJcIiBbbmdDbGFzc109XCJ7J3VpLXBpY2tsaXN0LWxpc3R3cmFwcGVyLW5vY29udHJvbHMnOiFzaG93U291cmNlQ29udHJvbHN9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXBpY2tsaXN0LWNhcHRpb24gdWktd2lkZ2V0LWhlYWRlciB1aS1jb3JuZXItdGwgdWktY29ybmVyLXRyXCIgKm5nSWY9XCJzb3VyY2VIZWFkZXJcIj57e3NvdXJjZUhlYWRlcn19PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXBpY2tsaXN0LWZpbHRlci1jb250YWluZXIgdWktd2lkZ2V0LWNvbnRlbnRcIiAqbmdJZj1cImZpbHRlckJ5ICYmIHNob3dTb3VyY2VGaWx0ZXIgIT09IGZhbHNlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCAjc291cmNlRmlsdGVyIHR5cGU9XCJ0ZXh0XCIgcm9sZT1cInRleHRib3hcIiAoa2V5dXApPVwib25GaWx0ZXIoJGV2ZW50LHNvdXJjZSxTT1VSQ0VfTElTVClcIiBjbGFzcz1cInVpLXBpY2tsaXN0LWZpbHRlciB1aS1pbnB1dHRleHQgdWktd2lkZ2V0IHVpLXN0YXRlLWRlZmF1bHQgdWktY29ybmVyLWFsbFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIFthdHRyLnBsYWNlaG9sZGVyXT1cInNvdXJjZUZpbHRlclBsYWNlaG9sZGVyXCIgW2F0dHIuYXJpYS1sYWJlbF09XCJhcmlhU291cmNlRmlsdGVyTGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1waWNrbGlzdC1maWx0ZXItaWNvbiBwaSBwaS1zZWFyY2hcIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHVsICNzb3VyY2VsaXN0IGNsYXNzPVwidWktd2lkZ2V0LWNvbnRlbnQgdWktcGlja2xpc3QtbGlzdCB1aS1waWNrbGlzdC1zb3VyY2UgdWktY29ybmVyLWJvdHRvbVwiIFtuZ0NsYXNzXT1cInsndWktcGlja2xpc3QtaGlnaGxpZ2h0JzogbGlzdEhpZ2hsaWdodFNvdXJjZX1cIiBcbiAgICAgICAgICAgICAgICAgICAgW25nU3R5bGVdPVwic291cmNlU3R5bGVcIiAoZHJhZ292ZXIpPVwib25MaXN0TW91c2VNb3ZlKCRldmVudCxTT1VSQ0VfTElTVClcIiAoZHJhZ2xlYXZlKT1cIm9uTGlzdERyYWdMZWF2ZSgpXCIgKGRyb3ApPVwib25MaXN0RHJvcCgkZXZlbnQsIFNPVVJDRV9MSVNUKVwiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1tdWx0aXNlbGVjdGFibGU9XCJtdWx0aXBsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwic291cmNlXCIgW25nRm9yVHJhY2tCeV09XCJzb3VyY2VUcmFja0J5IHx8IHRyYWNrQnlcIiBsZXQtaT1cImluZGV4XCIgbGV0LWw9XCJsYXN0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJ1aS1waWNrbGlzdC1kcm9wcG9pbnRcIiAqbmdJZj1cImRyYWdkcm9wXCIgKGRyYWdvdmVyKT1cIm9uRHJhZ092ZXIoJGV2ZW50LCBpLCBTT1VSQ0VfTElTVClcIiAoZHJvcCk9XCJvbkRyb3AoJGV2ZW50LCBpLCBTT1VSQ0VfTElTVClcIiAoZHJhZ2xlYXZlKT1cIm9uRHJhZ0xlYXZlKCRldmVudCwgU09VUkNFX0xJU1QpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktcGlja2xpc3QtZHJvcHBvaW50LWhpZ2hsaWdodCc6IChpID09PSBkcmFnT3Zlckl0ZW1JbmRleFNvdXJjZSl9XCIgW3N0eWxlLmRpc3BsYXldPVwiaXNJdGVtVmlzaWJsZShpdGVtLCBTT1VSQ0VfTElTVCkgPyAnYmxvY2snIDogJ25vbmUnXCI+PC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBbbmdDbGFzc109XCJ7J3VpLXBpY2tsaXN0LWl0ZW0nOnRydWUsJ3VpLXN0YXRlLWhpZ2hsaWdodCc6aXNTZWxlY3RlZChpdGVtLHNlbGVjdGVkSXRlbXNTb3VyY2UpLCAndWktc3RhdGUtZGlzYWJsZWQnOiBkaXNhYmxlZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJvbkl0ZW1DbGljaygkZXZlbnQsaXRlbSxzZWxlY3RlZEl0ZW1zU291cmNlLG9uU291cmNlU2VsZWN0KVwiIChkYmxjbGljayk9XCJvblNvdXJjZUl0ZW1EYmxDbGljaygpXCIgKHRvdWNoZW5kKT1cIm9uSXRlbVRvdWNoRW5kKCRldmVudClcIiAoa2V5ZG93bik9XCJvbkl0ZW1LZXlkb3duKCRldmVudCxpdGVtLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VTZWxlY3QpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3R5bGUuZGlzcGxheV09XCJpc0l0ZW1WaXNpYmxlKGl0ZW0sIFNPVVJDRV9MSVNUKSA/ICdibG9jaycgOiAnbm9uZSdcIiB0YWJpbmRleD1cIjBcIiByb2xlPVwib3B0aW9uXCIgW2F0dHIuYXJpYS1zZWxlY3RlZF09XCJpc1NlbGVjdGVkKGl0ZW0sIHNlbGVjdGVkSXRlbXNTb3VyY2UpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZHJhZ2dhYmxlXT1cImRyYWdkcm9wXCIgKGRyYWdzdGFydCk9XCJvbkRyYWdTdGFydCgkZXZlbnQsIGksIFNPVVJDRV9MSVNUKVwiIChkcmFnZW5kKT1cIm9uRHJhZ0VuZCgkZXZlbnQpXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cIml0ZW1UZW1wbGF0ZTsgY29udGV4dDogeyRpbXBsaWNpdDogaXRlbSwgaW5kZXg6IGl9XCI+PC9uZy1jb250YWluZXI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwidWktcGlja2xpc3QtZHJvcHBvaW50XCIgKm5nSWY9XCJkcmFnZHJvcCYmbFwiIChkcmFnb3Zlcik9XCJvbkRyYWdPdmVyKCRldmVudCwgaSArIDEsIFNPVVJDRV9MSVNUKVwiIChkcm9wKT1cIm9uRHJvcCgkZXZlbnQsIGkgKyAxLCBTT1VSQ0VfTElTVClcIiAoZHJhZ2xlYXZlKT1cIm9uRHJhZ0xlYXZlKCRldmVudCwgU09VUkNFX0xJU1QpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktcGlja2xpc3QtZHJvcHBvaW50LWhpZ2hsaWdodCc6IChpICsgMSA9PT0gZHJhZ092ZXJJdGVtSW5kZXhTb3VyY2UpfVwiPjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XG4gICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCIoc291cmNlID09IG51bGwgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgJiYgZW1wdHlNZXNzYWdlU291cmNlVGVtcGxhdGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInVpLXBpY2tsaXN0LWVtcHR5LW1lc3NhZ2VcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZW1wdHlNZXNzYWdlU291cmNlVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1waWNrbGlzdC1idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXBpY2tsaXN0LWJ1dHRvbnMtY2VsbFwiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS1yaWdodFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlUmlnaHQoKVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS1kb3VibGUtcmlnaHRcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiAoY2xpY2spPVwibW92ZUFsbFJpZ2h0KClcIj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBpY29uPVwicGkgcGktYW5nbGUtbGVmdFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlTGVmdCgpXCI+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHBCdXR0b24gaWNvbj1cInBpIHBpLWFuZ2xlLWRvdWJsZS1sZWZ0XCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVBbGxMZWZ0KClcIj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXBpY2tsaXN0LWxpc3R3cmFwcGVyIHVpLXBpY2tsaXN0LXRhcmdldC13cmFwcGVyXCIgW25nQ2xhc3NdPVwieyd1aS1waWNrbGlzdC1saXN0d3JhcHBlci1ub2NvbnRyb2xzJzohc2hvd1RhcmdldENvbnRyb2xzfVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1waWNrbGlzdC1jYXB0aW9uIHVpLXdpZGdldC1oZWFkZXIgdWktY29ybmVyLXRsIHVpLWNvcm5lci10clwiICpuZ0lmPVwidGFyZ2V0SGVhZGVyXCI+e3t0YXJnZXRIZWFkZXJ9fTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1waWNrbGlzdC1maWx0ZXItY29udGFpbmVyIHVpLXdpZGdldC1jb250ZW50XCIgKm5nSWY9XCJmaWx0ZXJCeSAmJiBzaG93VGFyZ2V0RmlsdGVyICE9PSBmYWxzZVwiPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgI3RhcmdldEZpbHRlciB0eXBlPVwidGV4dFwiIHJvbGU9XCJ0ZXh0Ym94XCIgKGtleXVwKT1cIm9uRmlsdGVyKCRldmVudCx0YXJnZXQsVEFSR0VUX0xJU1QpXCIgY2xhc3M9XCJ1aS1waWNrbGlzdC1maWx0ZXIgdWktaW5wdXR0ZXh0IHVpLXdpZGdldCB1aS1zdGF0ZS1kZWZhdWx0IHVpLWNvcm5lci1hbGxcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiBbYXR0ci5wbGFjZWhvbGRlcl09XCJ0YXJnZXRGaWx0ZXJQbGFjZWhvbGRlclwiIFthdHRyLmFyaWEtbGFiZWxdPVwiYXJpYVRhcmdldEZpbHRlckxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidWktcGlja2xpc3QtZmlsdGVyLWljb24gcGkgcGktc2VhcmNoXCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDx1bCAjdGFyZ2V0bGlzdCBjbGFzcz1cInVpLXdpZGdldC1jb250ZW50IHVpLXBpY2tsaXN0LWxpc3QgdWktcGlja2xpc3QtdGFyZ2V0IHVpLWNvcm5lci1ib3R0b21cIiBbbmdDbGFzc109XCJ7J3VpLXBpY2tsaXN0LWhpZ2hsaWdodCc6IGxpc3RIaWdobGlnaHRUYXJnZXR9XCIgXG4gICAgICAgICAgICAgICAgICAgIFtuZ1N0eWxlXT1cInRhcmdldFN0eWxlXCIgKGRyYWdvdmVyKT1cIm9uTGlzdE1vdXNlTW92ZSgkZXZlbnQsVEFSR0VUX0xJU1QpXCIgKGRyYWdsZWF2ZSk9XCJvbkxpc3REcmFnTGVhdmUoKVwiIChkcm9wKT1cIm9uTGlzdERyb3AoJGV2ZW50LFRBUkdFVF9MSVNUKVwiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1tdWx0aXNlbGVjdGFibGU9XCJtdWx0aXBsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwidGFyZ2V0XCIgW25nRm9yVHJhY2tCeV09XCJ0YXJnZXRUcmFja0J5IHx8IHRyYWNrQnlcIiBsZXQtaT1cImluZGV4XCIgbGV0LWw9XCJsYXN0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJ1aS1waWNrbGlzdC1kcm9wcG9pbnRcIiAqbmdJZj1cImRyYWdkcm9wXCIgKGRyYWdvdmVyKT1cIm9uRHJhZ092ZXIoJGV2ZW50LCBpLCBUQVJHRVRfTElTVClcIiAoZHJvcCk9XCJvbkRyb3AoJGV2ZW50LCBpLCBUQVJHRVRfTElTVClcIiAoZHJhZ2xlYXZlKT1cIm9uRHJhZ0xlYXZlKCRldmVudCwgVEFSR0VUX0xJU1QpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktcGlja2xpc3QtZHJvcHBvaW50LWhpZ2hsaWdodCc6IChpID09PSBkcmFnT3Zlckl0ZW1JbmRleFRhcmdldCl9XCIgW3N0eWxlLmRpc3BsYXldPVwiaXNJdGVtVmlzaWJsZShpdGVtLCBUQVJHRVRfTElTVCkgPyAnYmxvY2snIDogJ25vbmUnXCI+PC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBbbmdDbGFzc109XCJ7J3VpLXBpY2tsaXN0LWl0ZW0nOnRydWUsJ3VpLXN0YXRlLWhpZ2hsaWdodCc6aXNTZWxlY3RlZChpdGVtLHNlbGVjdGVkSXRlbXNUYXJnZXQpLCAndWktc3RhdGUtZGlzYWJsZWQnOiBkaXNhYmxlZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJvbkl0ZW1DbGljaygkZXZlbnQsaXRlbSxzZWxlY3RlZEl0ZW1zVGFyZ2V0LG9uVGFyZ2V0U2VsZWN0KVwiIChkYmxjbGljayk9XCJvblRhcmdldEl0ZW1EYmxDbGljaygpXCIgKHRvdWNoZW5kKT1cIm9uSXRlbVRvdWNoRW5kKCRldmVudClcIiAoa2V5ZG93bik9XCJvbkl0ZW1LZXlkb3duKCRldmVudCxpdGVtLHNlbGVjdGVkSXRlbXNUYXJnZXQsb25UYXJnZXRTZWxlY3QpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3R5bGUuZGlzcGxheV09XCJpc0l0ZW1WaXNpYmxlKGl0ZW0sIFRBUkdFVF9MSVNUKSA/ICdibG9jaycgOiAnbm9uZSdcIiB0YWJpbmRleD1cIjBcIiByb2xlPVwib3B0aW9uXCIgW2F0dHIuYXJpYS1zZWxlY3RlZF09XCJpc1NlbGVjdGVkKGl0ZW0sIHNlbGVjdGVkSXRlbXNUYXJnZXQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZHJhZ2dhYmxlXT1cImRyYWdkcm9wXCIgKGRyYWdzdGFydCk9XCJvbkRyYWdTdGFydCgkZXZlbnQsIGksIFRBUkdFVF9MSVNUKVwiIChkcmFnZW5kKT1cIm9uRHJhZ0VuZCgkZXZlbnQpXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cIml0ZW1UZW1wbGF0ZTsgY29udGV4dDogeyRpbXBsaWNpdDogaXRlbSwgaW5kZXg6IGl9XCI+PC9uZy1jb250YWluZXI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwidWktcGlja2xpc3QtZHJvcHBvaW50XCIgKm5nSWY9XCJkcmFnZHJvcCYmbFwiIChkcmFnb3Zlcik9XCJvbkRyYWdPdmVyKCRldmVudCwgaSArIDEsIFRBUkdFVF9MSVNUKVwiIChkcm9wKT1cIm9uRHJvcCgkZXZlbnQsIGkgKyAxLCBUQVJHRVRfTElTVClcIiAoZHJhZ2xlYXZlKT1cIm9uRHJhZ0xlYXZlKCRldmVudCwgVEFSR0VUX0xJU1QpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktcGlja2xpc3QtZHJvcHBvaW50LWhpZ2hsaWdodCc6IChpICsgMSA9PT0gZHJhZ092ZXJJdGVtSW5kZXhUYXJnZXQpfVwiPjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XG4gICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCIodGFyZ2V0ID09IG51bGwgfHwgdGFyZ2V0Lmxlbmd0aCA9PT0gMCkgJiYgZW1wdHlNZXNzYWdlVGFyZ2V0VGVtcGxhdGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInVpLXBpY2tsaXN0LWVtcHR5LW1lc3NhZ2VcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZW1wdHlNZXNzYWdlVGFyZ2V0VGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1waWNrbGlzdC10YXJnZXQtY29udHJvbHMgdWktcGlja2xpc3QtYnV0dG9uc1wiICpuZ0lmPVwic2hvd1RhcmdldENvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXBpY2tsaXN0LWJ1dHRvbnMtY2VsbFwiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS11cFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlVXAodGFyZ2V0bGlzdCx0YXJnZXQsc2VsZWN0ZWRJdGVtc1RhcmdldCxvblRhcmdldFJlb3JkZXIpXCI+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHBCdXR0b24gaWNvbj1cInBpIHBpLWFuZ2xlLWRvdWJsZS11cFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlVG9wKHRhcmdldGxpc3QsdGFyZ2V0LHNlbGVjdGVkSXRlbXNUYXJnZXQsb25UYXJnZXRSZW9yZGVyKVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS1kb3duXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVEb3duKHRhcmdldGxpc3QsdGFyZ2V0LHNlbGVjdGVkSXRlbXNUYXJnZXQsb25UYXJnZXRSZW9yZGVyKVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGljb249XCJwaSBwaS1hbmdsZS1kb3VibGUtZG93blwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlQm90dG9tKHRhcmdldGxpc3QsdGFyZ2V0LHNlbGVjdGVkSXRlbXNUYXJnZXQsb25UYXJnZXRSZW9yZGVyKVwiPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0XG59KVxuZXhwb3J0IGNsYXNzIFBpY2tMaXN0IGltcGxlbWVudHMgQWZ0ZXJWaWV3Q2hlY2tlZCxBZnRlckNvbnRlbnRJbml0IHtcblxuICAgIEBJbnB1dCgpIHNvdXJjZTogYW55W107XG5cbiAgICBASW5wdXQoKSB0YXJnZXQ6IGFueVtdO1xuXG4gICAgQElucHV0KCkgc291cmNlSGVhZGVyOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSB0YXJnZXRIZWFkZXI6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIHJlc3BvbnNpdmU6IGJvb2xlYW47XG4gICAgXG4gICAgQElucHV0KCkgZmlsdGVyQnk6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIHRyYWNrQnk6IEZ1bmN0aW9uID0gKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSkgPT4gaXRlbTtcblxuICAgIEBJbnB1dCgpIHNvdXJjZVRyYWNrQnk6IEZ1bmN0aW9uO1xuXG4gICAgQElucHV0KCkgdGFyZ2V0VHJhY2tCeTogRnVuY3Rpb247XG5cbiAgICBASW5wdXQoKSBzaG93U291cmNlRmlsdGVyOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIHNob3dUYXJnZXRGaWx0ZXI6IGJvb2xlYW4gPSB0cnVlO1xuICAgIFxuICAgIEBJbnB1dCgpIG1ldGFLZXlTZWxlY3Rpb246IGJvb2xlYW4gPSB0cnVlO1xuICAgIFxuICAgIEBJbnB1dCgpIGRyYWdkcm9wOiBib29sZWFuO1xuICAgIFxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XG5cbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSBzb3VyY2VTdHlsZTogYW55O1xuXG4gICAgQElucHV0KCkgdGFyZ2V0U3R5bGU6IGFueTtcbiAgICBcbiAgICBASW5wdXQoKSBzaG93U291cmNlQ29udHJvbHM6IGJvb2xlYW4gPSB0cnVlO1xuICAgIFxuICAgIEBJbnB1dCgpIHNob3dUYXJnZXRDb250cm9sczogYm9vbGVhbiA9IHRydWU7XG4gICAgXG4gICAgQElucHV0KCkgc291cmNlRmlsdGVyUGxhY2Vob2xkZXI6IHN0cmluZztcbiAgICBcbiAgICBASW5wdXQoKSB0YXJnZXRGaWx0ZXJQbGFjZWhvbGRlcjogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpIGFyaWFTb3VyY2VGaWx0ZXJMYWJlbDogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgYXJpYVRhcmdldEZpbHRlckxhYmVsOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSBmaWx0ZXJNYXRjaE1vZGU6IHN0cmluZyA9IFwiY29udGFpbnNcIjtcbiAgICBcbiAgICBAT3V0cHV0KCkgb25Nb3ZlVG9Tb3VyY2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIFxuICAgIEBPdXRwdXQoKSBvbk1vdmVBbGxUb1NvdXJjZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgXG4gICAgQE91dHB1dCgpIG9uTW92ZUFsbFRvVGFyZ2V0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBcbiAgICBAT3V0cHV0KCkgb25Nb3ZlVG9UYXJnZXQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIFxuICAgIEBPdXRwdXQoKSBvblNvdXJjZVJlb3JkZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIFxuICAgIEBPdXRwdXQoKSBvblRhcmdldFJlb3JkZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpIG9uU291cmNlU2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKSBvblRhcmdldFNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KCkgb25Tb3VyY2VGaWx0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpIG9uVGFyZ2V0RmlsdGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBWaWV3Q2hpbGQoJ3NvdXJjZWxpc3QnKSBsaXN0Vmlld1NvdXJjZUNoaWxkOiBFbGVtZW50UmVmO1xuICAgIFxuICAgIEBWaWV3Q2hpbGQoJ3RhcmdldGxpc3QnKSBsaXN0Vmlld1RhcmdldENoaWxkOiBFbGVtZW50UmVmO1xuXG4gICAgQFZpZXdDaGlsZCgnc291cmNlRmlsdGVyJykgc291cmNlRmlsdGVyVmlld0NoaWxkOiBFbGVtZW50UmVmO1xuXG4gICAgQFZpZXdDaGlsZCgndGFyZ2V0RmlsdGVyJykgdGFyZ2V0RmlsdGVyVmlld0NoaWxkOiBFbGVtZW50UmVmO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihQcmltZVRlbXBsYXRlKSB0ZW1wbGF0ZXM6IFF1ZXJ5TGlzdDxhbnk+O1xuICAgIFxuICAgIHB1YmxpYyBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgXG4gICAgcHVibGljIHZpc2libGVPcHRpb25zU291cmNlOiBhbnlbXTtcbiAgICBcbiAgICBwdWJsaWMgdmlzaWJsZU9wdGlvbnNUYXJnZXQ6IGFueVtdO1xuICAgICAgICAgICAgXG4gICAgc2VsZWN0ZWRJdGVtc1NvdXJjZTogYW55W10gPSBbXTtcbiAgICBcbiAgICBzZWxlY3RlZEl0ZW1zVGFyZ2V0OiBhbnlbXSA9IFtdO1xuICAgICAgICBcbiAgICByZW9yZGVyZWRMaXN0RWxlbWVudDogYW55O1xuICAgIFxuICAgIGRyYWdnZWRJdGVtSW5kZXhTb3VyY2U6IG51bWJlcjtcbiAgICBcbiAgICBkcmFnZ2VkSXRlbUluZGV4VGFyZ2V0OiBudW1iZXI7XG4gICAgXG4gICAgZHJhZ092ZXJJdGVtSW5kZXhTb3VyY2U6IG51bWJlcjtcbiAgICBcbiAgICBkcmFnT3Zlckl0ZW1JbmRleFRhcmdldDogbnVtYmVyO1xuICAgIFxuICAgIGRyYWdnaW5nOiBib29sZWFuO1xuICAgIFxuICAgIG1vdmVkVXA6IGJvb2xlYW47XG4gICAgXG4gICAgbW92ZWREb3duOiBib29sZWFuO1xuICAgIFxuICAgIGl0ZW1Ub3VjaGVkOiBib29sZWFuO1xuICAgIFxuICAgIGZpbHRlclZhbHVlU291cmNlOiBzdHJpbmc7XG4gICAgXG4gICAgZmlsdGVyVmFsdWVUYXJnZXQ6IHN0cmluZztcbiAgICBcbiAgICBmcm9tTGlzdFR5cGU6IG51bWJlcjtcbiAgICBcbiAgICB0b0xpc3RUeXBlOiBudW1iZXI7XG4gICAgXG4gICAgb25MaXN0SXRlbURyb3Bwb2ludDogYm9vbGVhbjtcbiAgICBcbiAgICBsaXN0SGlnaGxpZ2h0VGFyZ2V0OiBib29sZWFuO1xuICAgIFxuICAgIGxpc3RIaWdobGlnaHRTb3VyY2U6IGJvb2xlYW47XG5cbiAgICBlbXB0eU1lc3NhZ2VTb3VyY2VUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIGVtcHR5TWVzc2FnZVRhcmdldFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gICAgcmVhZG9ubHkgU09VUkNFX0xJU1QgPSAtMTtcblxuICAgIHJlYWRvbmx5IFRBUkdFVF9MSVNUID0gMTtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZikge31cbiAgICBcbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHRoaXMudGVtcGxhdGVzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2l0ZW0nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1UZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdlbXB0eW1lc3NhZ2Vzb3VyY2UnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtcHR5TWVzc2FnZVNvdXJjZVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2VtcHR5bWVzc2FnZXRhcmdldCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1wdHlNZXNzYWdlVGFyZ2V0VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1UZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAgICAgXG4gICAgbmdBZnRlclZpZXdDaGVja2VkKCkge1xuICAgICAgICBpZiAodGhpcy5tb3ZlZFVwfHx0aGlzLm1vdmVkRG93bikge1xuICAgICAgICAgICAgbGV0IGxpc3RJdGVtcyA9IERvbUhhbmRsZXIuZmluZCh0aGlzLnJlb3JkZXJlZExpc3RFbGVtZW50LCAnbGkudWktc3RhdGUtaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICBsZXQgbGlzdEl0ZW07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkVXApXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSBsaXN0SXRlbXNbMF07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSBsaXN0SXRlbXNbbGlzdEl0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBEb21IYW5kbGVyLnNjcm9sbEluVmlldyh0aGlzLnJlb3JkZXJlZExpc3RFbGVtZW50LCBsaXN0SXRlbSk7XG4gICAgICAgICAgICB0aGlzLm1vdmVkVXAgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubW92ZWREb3duID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnJlb3JkZXJlZExpc3RFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBvbkl0ZW1DbGljayhldmVudCwgaXRlbTogYW55LCBzZWxlY3RlZEl0ZW1zOiBhbnlbXSwgY2FsbGJhY2s6IEV2ZW50RW1pdHRlcjxhbnk+KSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuZmluZEluZGV4SW5TZWxlY3Rpb24oaXRlbSxzZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgbGV0IHNlbGVjdGVkID0gKGluZGV4ICE9IC0xKTtcbiAgICAgICAgbGV0IG1ldGFTZWxlY3Rpb24gPSB0aGlzLml0ZW1Ub3VjaGVkID8gZmFsc2UgOiB0aGlzLm1ldGFLZXlTZWxlY3Rpb247XG4gICAgICAgIFxuICAgICAgICBpZiAobWV0YVNlbGVjdGlvbikge1xuICAgICAgICAgICAgbGV0IG1ldGFLZXkgPSAoZXZlbnQubWV0YUtleXx8ZXZlbnQuY3RybEtleXx8ZXZlbnQuc2hpZnRLZXkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgJiYgbWV0YUtleSkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghbWV0YUtleSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW1zLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgfSAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZClcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2suZW1pdCh7b3JpZ2luYWxFdmVudDogZXZlbnQsIGl0ZW1zOiBzZWxlY3RlZEl0ZW1zfSk7XG5cbiAgICAgICAgdGhpcy5pdGVtVG91Y2hlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBvblNvdXJjZUl0ZW1EYmxDbGljaygpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5tb3ZlUmlnaHQoKTtcbiAgICB9XG4gICAgXG4gICAgb25UYXJnZXRJdGVtRGJsQ2xpY2soKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMubW92ZUxlZnQoKTtcbiAgICB9XG4gICAgXG4gICAgb25GaWx0ZXIoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIGRhdGE6IGFueVtdLCBsaXN0VHlwZTogbnVtYmVyKSB7XG4gICAgICAgIGxldCBxdWVyeSA9ICg8SFRNTElucHV0RWxlbWVudD4gZXZlbnQudGFyZ2V0KS52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgbGV0IHNlYXJjaEZpZWxkcyA9IHRoaXMuZmlsdGVyQnkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAobGlzdFR5cGUgPT09IHRoaXMuU09VUkNFX0xJU1QpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVmFsdWVTb3VyY2UgPSBxdWVyeTtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2UgPSBGaWx0ZXJVdGlscy5maWx0ZXIoZGF0YSwgc2VhcmNoRmllbGRzLCB0aGlzLmZpbHRlclZhbHVlU291cmNlLCB0aGlzLmZpbHRlck1hdGNoTW9kZSk7XG4gICAgICAgICAgICB0aGlzLm9uU291cmNlRmlsdGVyLmVtaXQoe3F1ZXJ5OiB0aGlzLmZpbHRlclZhbHVlU291cmNlLCB2YWx1ZTogdGhpcy52aXNpYmxlT3B0aW9uc1NvdXJjZX0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGxpc3RUeXBlID09PSB0aGlzLlRBUkdFVF9MSVNUKSB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlclZhbHVlVGFyZ2V0ID0gcXVlcnk7XG4gICAgICAgICAgICB0aGlzLnZpc2libGVPcHRpb25zVGFyZ2V0ID0gRmlsdGVyVXRpbHMuZmlsdGVyKGRhdGEsIHNlYXJjaEZpZWxkcywgdGhpcy5maWx0ZXJWYWx1ZVRhcmdldCwgdGhpcy5maWx0ZXJNYXRjaE1vZGUpO1xuICAgICAgICAgICAgdGhpcy5vblRhcmdldEZpbHRlci5lbWl0KHtxdWVyeTogdGhpcy5maWx0ZXJWYWx1ZVRhcmdldCwgdmFsdWU6IHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXR9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAgICAgXG4gICAgaXNJdGVtVmlzaWJsZShpdGVtOiBhbnksIGxpc3RUeXBlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGxpc3RUeXBlID09IHRoaXMuU09VUkNFX0xJU1QpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGVJbkxpc3QodGhpcy52aXNpYmxlT3B0aW9uc1NvdXJjZSwgaXRlbSwgdGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlzVmlzaWJsZUluTGlzdCh0aGlzLnZpc2libGVPcHRpb25zVGFyZ2V0LCBpdGVtLCB0aGlzLmZpbHRlclZhbHVlVGFyZ2V0KTtcbiAgICB9XG4gICAgXG4gICAgaXNWaXNpYmxlSW5MaXN0KGRhdGE6IGFueVtdLCBpdGVtOiBhbnksIGZpbHRlclZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGZpbHRlclZhbHVlICYmIGZpbHRlclZhbHVlLnRyaW0oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gPT0gZGF0YVtpXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBvbkl0ZW1Ub3VjaEVuZChldmVudCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLml0ZW1Ub3VjaGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNvcnRCeUluZGV4SW5MaXN0KGl0ZW1zOiBhbnlbXSwgbGlzdDogYW55KSB7XG4gICAgICAgIHJldHVybiBpdGVtcy5zb3J0KChpdGVtMSwgaXRlbTIpID0+XG4gICAgICAgICAgICB0aGlzLmZpbmRJbmRleEluTGlzdChpdGVtMSwgbGlzdCkgLSB0aGlzLmZpbmRJbmRleEluTGlzdChpdGVtMiwgbGlzdCkpO1xuICAgIH1cblxuICAgIG1vdmVVcChsaXN0RWxlbWVudCwgbGlzdCwgc2VsZWN0ZWRJdGVtcywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHNlbGVjdGVkSXRlbXMgJiYgc2VsZWN0ZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXMgPSB0aGlzLnNvcnRCeUluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbXMsIGxpc3QpO1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHNlbGVjdGVkSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtID0gc2VsZWN0ZWRJdGVtc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtSW5kZXg6IG51bWJlciA9IHRoaXMuZmluZEluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbSwgbGlzdCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtSW5kZXggIT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW92ZWRJdGVtID0gbGlzdFtzZWxlY3RlZEl0ZW1JbmRleF07XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gbGlzdFtzZWxlY3RlZEl0ZW1JbmRleC0xXTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtzZWxlY3RlZEl0ZW1JbmRleC0xXSA9IG1vdmVkSXRlbTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtzZWxlY3RlZEl0ZW1JbmRleF0gPSB0ZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm1vdmVkVXAgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZW9yZGVyZWRMaXN0RWxlbWVudCA9IGxpc3RFbGVtZW50O1xuICAgICAgICAgICAgY2FsbGJhY2suZW1pdCh7aXRlbXM6IHNlbGVjdGVkSXRlbXN9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVUb3AobGlzdEVsZW1lbnQsIGxpc3QsIHNlbGVjdGVkSXRlbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChzZWxlY3RlZEl0ZW1zICYmIHNlbGVjdGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zID0gdGhpcy5zb3J0QnlJbmRleEluTGlzdChzZWxlY3RlZEl0ZW1zLCBsaXN0KTtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzZWxlY3RlZEl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbSA9IHNlbGVjdGVkSXRlbXNbaV07XG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbUluZGV4OiBudW1iZXIgPSB0aGlzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIGxpc3QpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkSXRlbUluZGV4ICE9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vdmVkSXRlbSA9IGxpc3Quc3BsaWNlKHNlbGVjdGVkSXRlbUluZGV4LDEpWzBdO1xuICAgICAgICAgICAgICAgICAgICBsaXN0LnVuc2hpZnQobW92ZWRJdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGlzdEVsZW1lbnQuc2Nyb2xsVG9wID0gMDtcbiAgICAgICAgICAgIGNhbGxiYWNrLmVtaXQoe2l0ZW1zOiBzZWxlY3RlZEl0ZW1zfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlRG93bihsaXN0RWxlbWVudCwgbGlzdCwgc2VsZWN0ZWRJdGVtcywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHNlbGVjdGVkSXRlbXMgJiYgc2VsZWN0ZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXMgPSB0aGlzLnNvcnRCeUluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbXMsIGxpc3QpO1xuICAgICAgICAgICAgZm9yKGxldCBpID0gc2VsZWN0ZWRJdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1zW2ldO1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW1JbmRleDogbnVtYmVyID0gdGhpcy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCBsaXN0KTtcblxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW1JbmRleCAhPSAobGlzdC5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW92ZWRJdGVtID0gbGlzdFtzZWxlY3RlZEl0ZW1JbmRleF07XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gbGlzdFtzZWxlY3RlZEl0ZW1JbmRleCsxXTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtzZWxlY3RlZEl0ZW1JbmRleCsxXSA9IG1vdmVkSXRlbTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtzZWxlY3RlZEl0ZW1JbmRleF0gPSB0ZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm1vdmVkRG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnJlb3JkZXJlZExpc3RFbGVtZW50ID0gbGlzdEVsZW1lbnQ7XG4gICAgICAgICAgICBjYWxsYmFjay5lbWl0KHtpdGVtczogc2VsZWN0ZWRJdGVtc30pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZUJvdHRvbShsaXN0RWxlbWVudCwgbGlzdCwgc2VsZWN0ZWRJdGVtcywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHNlbGVjdGVkSXRlbXMgJiYgc2VsZWN0ZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXMgPSB0aGlzLnNvcnRCeUluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbXMsIGxpc3QpO1xuICAgICAgICAgICAgZm9yKGxldCBpID0gc2VsZWN0ZWRJdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1zW2ldO1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW1JbmRleDogbnVtYmVyID0gdGhpcy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCBsaXN0KTtcblxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW1JbmRleCAhPSAobGlzdC5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW92ZWRJdGVtID0gbGlzdC5zcGxpY2Uoc2VsZWN0ZWRJdGVtSW5kZXgsMSlbMF07XG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChtb3ZlZEl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsaXN0RWxlbWVudC5zY3JvbGxUb3AgPSBsaXN0RWxlbWVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICBjYWxsYmFjay5lbWl0KHtpdGVtczogc2VsZWN0ZWRJdGVtc30pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZVJpZ2h0KCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zU291cmNlICYmIHRoaXMuc2VsZWN0ZWRJdGVtc1NvdXJjZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkSXRlbXNTb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW1zU291cmNlW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIHRoaXMudGFyZ2V0KSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5wdXNoKHRoaXMuc291cmNlLnNwbGljZSh0aGlzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIHRoaXMuc291cmNlKSwxKVswXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbk1vdmVUb1RhcmdldC5lbWl0KHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5zZWxlY3RlZEl0ZW1zU291cmNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtc1NvdXJjZSA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW92ZUFsbFJpZ2h0KCkge1xuICAgICAgICBpZiAodGhpcy5zb3VyY2UpIHtcbiAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW1zID0gW107XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnNvdXJjZS5sZW5ndGg7IGkrKykgeyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0l0ZW1WaXNpYmxlKHRoaXMuc291cmNlW2ldLCB0aGlzLlNPVVJDRV9MSVNUKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZEl0ZW0gPSB0aGlzLnNvdXJjZS5zcGxpY2UoaSwgMSlbMF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnB1c2gocmVtb3ZlZEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICBtb3ZlZEl0ZW1zLnB1c2gocmVtb3ZlZEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5vbk1vdmVUb1RhcmdldC5lbWl0KHtcbiAgICAgICAgICAgICAgICBpdGVtczogbW92ZWRJdGVtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMub25Nb3ZlQWxsVG9UYXJnZXQuZW1pdCh7XG4gICAgICAgICAgICAgICAgaXRlbXM6IG1vdmVkSXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXNTb3VyY2UgPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVMZWZ0KCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zVGFyZ2V0ICYmIHRoaXMuc2VsZWN0ZWRJdGVtc1RhcmdldC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkSXRlbXNUYXJnZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW1zVGFyZ2V0W2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIHRoaXMuc291cmNlKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZS5wdXNoKHRoaXMudGFyZ2V0LnNwbGljZSh0aGlzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIHRoaXMudGFyZ2V0KSwxKVswXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbk1vdmVUb1NvdXJjZS5lbWl0KHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5zZWxlY3RlZEl0ZW1zVGFyZ2V0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zVGFyZ2V0ID0gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlQWxsTGVmdCgpIHtcbiAgICAgICAgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgICAgICAgICBsZXQgbW92ZWRJdGVtcyA9IFtdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YXJnZXQubGVuZ3RoOyBpKyspIHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNJdGVtVmlzaWJsZSh0aGlzLnRhcmdldFtpXSwgdGhpcy5UQVJHRVRfTElTVCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWRJdGVtID0gdGhpcy50YXJnZXQuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZS5wdXNoKHJlbW92ZWRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgbW92ZWRJdGVtcy5wdXNoKHJlbW92ZWRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIHRoaXMub25Nb3ZlVG9Tb3VyY2UuZW1pdCh7XG4gICAgICAgICAgICAgICAgaXRlbXM6IG1vdmVkSXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm9uTW92ZUFsbFRvU291cmNlLmVtaXQoe1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBtb3ZlZEl0ZW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zVGFyZ2V0ID0gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc1NlbGVjdGVkKGl0ZW06IGFueSwgc2VsZWN0ZWRJdGVtczogYW55W10pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZEluZGV4SW5TZWxlY3Rpb24oaXRlbSwgc2VsZWN0ZWRJdGVtcykgIT0gLTE7XG4gICAgfVxuICAgIFxuICAgIGZpbmRJbmRleEluU2VsZWN0aW9uKGl0ZW06IGFueSwgc2VsZWN0ZWRJdGVtczogYW55W10pOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5maW5kSW5kZXhJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcyk7XG4gICAgfVxuICAgIFxuICAgIGZpbmRJbmRleEluTGlzdChpdGVtOiBhbnksIGxpc3Q6IGFueSk6IG51bWJlciB7XG4gICAgICAgIGxldCBpbmRleDogbnVtYmVyID0gLTE7XG4gICAgICAgIFxuICAgICAgICBpZiAobGlzdCkge1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAobGlzdFtpXSA9PSBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuICAgIFxuICAgIG9uRHJhZ1N0YXJ0KGV2ZW50OiBEcmFnRXZlbnQsIGluZGV4OiBudW1iZXIsIGxpc3RUeXBlOiBudW1iZXIpIHtcbiAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQnLCAnYicpOyAgICAvLyBGb3IgZmlyZWZveFxuICAgICAgICAoPEhUTUxMSUVsZW1lbnQ+IGV2ZW50LnRhcmdldCkuYmx1cigpO1xuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5mcm9tTGlzdFR5cGUgPSBsaXN0VHlwZTtcblxuICAgICAgICBpZiAobGlzdFR5cGUgPT09IHRoaXMuU09VUkNFX0xJU1QpXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWRJdGVtSW5kZXhTb3VyY2UgPSBpbmRleDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkSXRlbUluZGV4VGFyZ2V0ID0gaW5kZXg7XG4gICAgfVxuICAgIFxuICAgIG9uRHJhZ092ZXIoZXZlbnQ6IERyYWdFdmVudCwgaW5kZXg6IG51bWJlciwgbGlzdFR5cGU6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZykge1xuICAgICAgICAgICAgaWYgKGxpc3RUeXBlID09IHRoaXMuU09VUkNFX0xJU1QpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2VkSXRlbUluZGV4U291cmNlICE9PSBpbmRleCAmJiB0aGlzLmRyYWdnZWRJdGVtSW5kZXhTb3VyY2UgKyAxICE9PSBpbmRleCB8fMKgKHRoaXMuZnJvbUxpc3RUeXBlID09PSB0aGlzLlRBUkdFVF9MSVNUKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdPdmVySXRlbUluZGV4U291cmNlID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFRhcmdldCAhPT0gaW5kZXggJiYgdGhpcy5kcmFnZ2VkSXRlbUluZGV4VGFyZ2V0ICsgMSAhPT0gaW5kZXggfHzCoCh0aGlzLmZyb21MaXN0VHlwZSA9PT0gdGhpcy5TT1VSQ0VfTElTVCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnT3Zlckl0ZW1JbmRleFRhcmdldCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub25MaXN0SXRlbURyb3Bwb2ludCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgb25EcmFnTGVhdmUoZXZlbnQ6IERyYWdFdmVudCwgbGlzdFR5cGU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmRyYWdPdmVySXRlbUluZGV4U291cmNlID0gbnVsbDsgXG4gICAgICAgIHRoaXMuZHJhZ092ZXJJdGVtSW5kZXhUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLm9uTGlzdEl0ZW1Ecm9wcG9pbnQgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgb25Ecm9wKGV2ZW50OiBEcmFnRXZlbnQsIGluZGV4OiBudW1iZXIsIGxpc3RUeXBlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMub25MaXN0SXRlbURyb3Bwb2ludCkge1xuICAgICAgICAgICAgaWYgKGxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJvbUxpc3RUeXBlID09PSB0aGlzLlRBUkdFVF9MSVNUKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFRhcmdldCwgdGhpcy50YXJnZXQsIGluZGV4LCB0aGlzLnNvdXJjZSwgdGhpcy5vbk1vdmVUb1NvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3RVdGlscy5yZW9yZGVyQXJyYXkodGhpcy5zb3VyY2UsIHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFNvdXJjZSwgKHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFNvdXJjZSA+IGluZGV4KSA/IGluZGV4IDogKGluZGV4ID09PSAwKSA/IDAgOiBpbmRleCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU291cmNlUmVvcmRlci5lbWl0KHtpdGVtczogdGhpcy5zb3VyY2VbdGhpcy5kcmFnZ2VkSXRlbUluZGV4U291cmNlXX0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ092ZXJJdGVtSW5kZXhTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJvbUxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFNvdXJjZSwgdGhpcy5zb3VyY2UsIGluZGV4LCB0aGlzLnRhcmdldCwgdGhpcy5vbk1vdmVUb1RhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3RVdGlscy5yZW9yZGVyQXJyYXkodGhpcy50YXJnZXQsIHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFRhcmdldCwgKHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFRhcmdldCA+IGluZGV4KSA/IGluZGV4IDogKGluZGV4ID09PSAwKSA/IDAgOiBpbmRleCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uVGFyZ2V0UmVvcmRlci5lbWl0KHtpdGVtczogdGhpcy50YXJnZXRbdGhpcy5kcmFnZ2VkSXRlbUluZGV4VGFyZ2V0XX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnT3Zlckl0ZW1JbmRleFRhcmdldCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubGlzdEhpZ2hsaWdodFRhcmdldCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5saXN0SGlnaGxpZ2h0U291cmNlID0gZmFsc2U7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIG9uRHJhZ0VuZChldmVudDogRHJhZ0V2ZW50KSB7XG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgb25MaXN0RHJvcChldmVudDogRHJhZ0V2ZW50LCBsaXN0VHlwZTogIG51bWJlcikge1xuICAgICAgICBpZiAoIXRoaXMub25MaXN0SXRlbURyb3Bwb2ludCkge1xuICAgICAgICAgICAgaWYgKGxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJvbUxpc3RUeXBlID09PSB0aGlzLlRBUkdFVF9MSVNUKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KHRoaXMuZHJhZ2dlZEl0ZW1JbmRleFRhcmdldCwgdGhpcy50YXJnZXQsIG51bGwsIHRoaXMuc291cmNlLCB0aGlzLm9uTW92ZVRvU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mcm9tTGlzdFR5cGUgPT09IHRoaXMuU09VUkNFX0xJU1QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnQodGhpcy5kcmFnZ2VkSXRlbUluZGV4U291cmNlLCB0aGlzLnNvdXJjZSwgbnVsbCwgdGhpcy50YXJnZXQsIHRoaXMub25Nb3ZlVG9UYXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5saXN0SGlnaGxpZ2h0VGFyZ2V0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxpc3RIaWdobGlnaHRTb3VyY2UgPSBmYWxzZTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaW5zZXJ0KGZyb21JbmRleCwgZnJvbUxpc3QsIHRvSW5kZXgsIHRvTGlzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHRvbW92ZSA9IGZyb21MaXN0W2Zyb21JbmRleF07XG4gICAgICAgIFxuICAgICAgICBpZiAodG9JbmRleCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRvTGlzdC5wdXNoKGZyb21MaXN0LnNwbGljZShmcm9tSW5kZXgsIDEpWzBdKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdG9MaXN0LnNwbGljZSh0b0luZGV4LCAwLCBmcm9tTGlzdC5zcGxpY2UoZnJvbUluZGV4LCAxKVswXSk7XG4gICAgICAgICAgICBcbiAgICAgICAgY2FsbGJhY2suZW1pdCh7XG4gICAgICAgICAgICBpdGVtczogW2VsZW1lbnR0b21vdmVdXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBvbkxpc3RNb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQsIGxpc3RUeXBlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIGxldCBtb3ZlTGlzdFR5cGUgPSAobGlzdFR5cGUgPT0gMCA/IHRoaXMubGlzdFZpZXdTb3VyY2VDaGlsZCA6IHRoaXMubGlzdFZpZXdUYXJnZXRDaGlsZCk7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0WSA9IG1vdmVMaXN0VHlwZS5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgbGV0IGJvdHRvbURpZmYgPSAob2Zmc2V0WSArIG1vdmVMaXN0VHlwZS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCkgLSBldmVudC5wYWdlWTtcbiAgICAgICAgICAgIGxldCB0b3BEaWZmID0gKGV2ZW50LnBhZ2VZIC0gb2Zmc2V0WSk7XG5cbiAgICAgICAgICAgIGlmIChib3R0b21EaWZmIDwgMjUgJiYgYm90dG9tRGlmZiA+IDApXG4gICAgICAgICAgICAgICAgbW92ZUxpc3RUeXBlLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wICs9IDE1O1xuICAgICAgICAgICAgZWxzZSBpZiAodG9wRGlmZiA8IDI1ICYmIHRvcERpZmYgPiAwKVxuICAgICAgICAgICAgICAgIG1vdmVMaXN0VHlwZS5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCAtPSAxNTtcblxuICAgICAgICAgICAgaWYgKGxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJvbUxpc3RUeXBlID09PSB0aGlzLlRBUkdFVF9MSVNUKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RIaWdobGlnaHRTb3VyY2UgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJvbUxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RIaWdobGlnaHRUYXJnZXQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIG9uTGlzdERyYWdMZWF2ZSgpIHtcbiAgICAgICAgdGhpcy5saXN0SGlnaGxpZ2h0VGFyZ2V0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGlzdEhpZ2hsaWdodFNvdXJjZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJlc2V0RmlsdGVyKCkge1xuICAgICAgICB0aGlzLnZpc2libGVPcHRpb25zU291cmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSA9IG51bGw7XG4gICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLmZpbHRlclZhbHVlVGFyZ2V0ID0gbnVsbDtcblxuICAgICAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+IHRoaXMuc291cmNlRmlsdGVyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQpLnZhbHVlID0gJyc7XG4gICAgICAgICg8SFRNTElucHV0RWxlbWVudD4gdGhpcy50YXJnZXRGaWx0ZXJWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCkudmFsdWUgPSAnJztcbiAgICB9XG4gICAgXG4gICAgb25JdGVtS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCwgaXRlbTogYW55LCBzZWxlY3RlZEl0ZW1zOiBhbnlbXSwgY2FsbGJhY2s6IEV2ZW50RW1pdHRlcjxhbnk+KSB7XG4gICAgICAgIGxldCBsaXN0SXRlbSA9IDxIVE1MTElFbGVtZW50PiBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoKGV2ZW50LndoaWNoKSB7XG4gICAgICAgICAgICAvL2Rvd25cbiAgICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICAgICAgdmFyIG5leHRJdGVtID0gdGhpcy5maW5kTmV4dEl0ZW0obGlzdEl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SXRlbS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdXBcbiAgICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICAgICAgdmFyIHByZXZJdGVtID0gdGhpcy5maW5kUHJldkl0ZW0obGlzdEl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChwcmV2SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2SXRlbS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZW50ZXJcbiAgICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgICAgdGhpcy5vbkl0ZW1DbGljayhldmVudCwgaXRlbSwgc2VsZWN0ZWRJdGVtcywgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICAgICAgXG4gICAgZmluZE5leHRJdGVtKGl0ZW0pIHtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gaXRlbS5uZXh0RWxlbWVudFNpYmxpbmc7XG5cbiAgICAgICAgaWYgKG5leHRJdGVtKVxuICAgICAgICAgICAgcmV0dXJuICFEb21IYW5kbGVyLmhhc0NsYXNzKG5leHRJdGVtLCAndWktcGlja2xpc3QtaXRlbScpIHx8IERvbUhhbmRsZXIuaXNIaWRkZW4obmV4dEl0ZW0pID8gdGhpcy5maW5kTmV4dEl0ZW0obmV4dEl0ZW0pIDogbmV4dEl0ZW07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZpbmRQcmV2SXRlbShpdGVtKSB7XG4gICAgICAgIGxldCBwcmV2SXRlbSA9IGl0ZW0ucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgXG4gICAgICAgIGlmIChwcmV2SXRlbSlcbiAgICAgICAgICAgIHJldHVybiAhRG9tSGFuZGxlci5oYXNDbGFzcyhwcmV2SXRlbSwgJ3VpLXBpY2tsaXN0LWl0ZW0nKSB8fCBEb21IYW5kbGVyLmlzSGlkZGVuKHByZXZJdGVtKSA/IHRoaXMuZmluZFByZXZJdGVtKHByZXZJdGVtKSA6IHByZXZJdGVtO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9IFxufVxuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsQnV0dG9uTW9kdWxlLFNoYXJlZE1vZHVsZV0sXG4gICAgZXhwb3J0czogW1BpY2tMaXN0LFNoYXJlZE1vZHVsZV0sXG4gICAgZGVjbGFyYXRpb25zOiBbUGlja0xpc3RdXG59KVxuZXhwb3J0IGNsYXNzIFBpY2tMaXN0TW9kdWxlIHsgfVxuIl19