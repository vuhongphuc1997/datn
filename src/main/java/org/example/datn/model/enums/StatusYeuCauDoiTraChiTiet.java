package org.example.datn.model.enums;

public enum StatusYeuCauDoiTraChiTiet {
    CHO_XU_LY(0),
    HOAN_THANH(1),
    TU_CHOI(2) ;

    private final int value;

    StatusYeuCauDoiTraChiTiet(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }
}
