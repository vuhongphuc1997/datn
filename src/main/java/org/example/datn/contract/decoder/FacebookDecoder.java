package org.example.datn.contract.decoder;

import lombok.extern.slf4j.Slf4j;
import org.example.datn.contract.FacebookServiceClient.FbError;
import org.example.datn.model.ErrorModel;

@Slf4j
public class FacebookDecoder extends AbstractDecoder<FbError> {

    public FacebookDecoder() {
        super(FbError.class);
    }

    @Override
    protected ErrorModel badRequest(FbError fbError) {
        var errorDetail = fbError.getError();
        return ErrorModel.of("access.denied", errorDetail.getType(), errorDetail.getMessage());
    }
}