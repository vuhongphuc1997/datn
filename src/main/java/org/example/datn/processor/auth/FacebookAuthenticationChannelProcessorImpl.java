package org.example.datn.processor.auth;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.example.datn.contract.FacebookServiceClient;
import org.example.datn.exception.CommonException;
import org.example.datn.model.enums.UserType;
import org.example.datn.model.response.UserModel;
import org.example.datn.service.ProfileService;
import org.example.datn.service.UserService;
import org.example.datn.transformer.ProfileTransformer;
import org.example.datn.transformer.UserTransformer;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.util.function.Supplier;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FacebookAuthenticationChannelProcessorImpl extends AbstractAuthenticationChannelProcessor {
    FacebookServiceClient facebookServiceClient;


    protected FacebookAuthenticationChannelProcessorImpl(AuthenticationChannelProvider provider,
                                                         FacebookServiceClient facebookServiceClient,
                                                         UserService userService, UserTransformer userTransformer,
                                                         ProfileService profileService,
                                                         ProfileTransformer profileTransformer


    ) {
        super(UserType.FB, provider, userService, userTransformer, profileService, profileTransformer
        );
        this.facebookServiceClient = facebookServiceClient;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public UserModel auth(Supplier<?> input) throws CommonException {
        var token = (String) input.get();
        var fbUser = facebookServiceClient.getInfo(token);

        var userId = userTransformer.mapIdSociety(type, fbUser.getId());
        var user = createUserAndProfileIfNotExists(userId,
                u -> profileTransformer.toEntity(u.getId(), fbUser.getName(), fbUser.getEmail()));

        return userTransformer.toModel(user);
    }
}
