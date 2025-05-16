package org.example.datn.exception;

import org.example.datn.model.ErrorModel;

public class UnknownException extends CommonException
{

    private UnknownException(String message) {
        super(message);
    }

    private UnknownException(ErrorModel errorModel) {
        super(errorModel);
    }

    public static UnknownException of() {
        return new UnknownException("msg.internal.error");
    }
}

