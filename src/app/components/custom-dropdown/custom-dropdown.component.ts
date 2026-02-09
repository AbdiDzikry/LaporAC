import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DropdownOption {
    label: string;
    value: any;
}

@Component({
    selector: 'app-custom-dropdown',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './custom-dropdown.component.html',
})
export class CustomDropdownComponent {
    @Input() options: DropdownOption[] = [];
    @Input() value: any;
    @Input() placeholder: string = 'Select Option';
    @Input() icon: string = ''; // Optional icon class or svg path logic could be added
    @Input() label: string = ''; // Label for the dropdown

    @Output() valueChange = new EventEmitter<any>();

    isOpen = false;

    constructor(private elementRef: ElementRef) { }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    selectOption(option: DropdownOption) {
        this.value = option.value;
        this.valueChange.emit(this.value);
        this.isOpen = false;
    }

    get selectedLabel(): string {
        const selected = this.options.find(o => o.value === this.value);
        return selected ? selected.label : this.placeholder;
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }
}
